import {asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const generateAccessAndRefreshTokens= async (userId) =>{
  try {
    const user=await User.findById(userId);
    const accessToken=user.generateAcessToken()
    const refreshToken=user.generateRefreshToken()
    user.refreshToken=refreshToken
    await user.save({validateBeforeSave : false})

    return {accessToken,refreshToken}

  } catch (error) {
    throw new ApiError(500,"Something went wrog while generating access and refrehs token")
  }
}

const registerUser= asyncHandler( async (req,res) => {
  //GETTING VALUES FROM FRONTEND
  const {fullName,email,username,password}=req.body
  console.log(req.body);
  
  console.log("email : ",email);
  
  //VALIDATION TO CHECK THAT THERE ISNT NAY EMPTY VAL
  if(
    [fullName,email,username,password].some((field)=>
    field?.trim()==="")
  ){
    throw new ApiError(400,"All fields are required");
  }
  //CHECKING TO SEE IF USER EXISTS OR NOT
  const existedUser= await User.findOne({
    $or :  [ { username }, { email } ]
  })
  
  if(existedUser){
    console.log(existedUser.tree);
    
    throw new ApiError(409,"User with email or username already exists")
  }
  //CHECKING FOR FILES
  console.log(req.files);
  
  const avatarLocalPath= req.files?.avatar[0]?.path;
  // const coverImageLocalPath=req.files?.coverImage[0]?.path;
  //traditional method of checking 
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0 ){
    coverImageLocalPath=req.files.coverImage[0].path;
  }
  
  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required");
  }

  //UPLOADING ON CLOUDINARY 
  const avatar =await uploadOnCloudinary(avatarLocalPath)
  const coverImage=await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(400,"Avatar file is required");
  }
  
  //UPLOADING ON DB
  const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage : coverImage?.url || "",
    email,
    password,
    username : username.toLowerCase()
  })

  const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user");
  }
//RETURNING USER OBJECT 
  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
  );

})

const loginUser= asyncHandler(async (req,res)=>{
  const {email,username,password}=req.body

  if(!username || !email){
    throw new ApiError(400,"username or email is required");
  }

  const user=await User.findOne({
    $or: [ {username} , {email} ]
  })

  if(!user){
    throw new ApiError(404,"user does not exist");
  }

  const isPasswordValid=await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401,"Invalid User credentials");
  }

 const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

 const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

 const options={
  hhtpOnly:true,
  secure:true
 }

 return res
 .status(200)
 .cookier("accessToken",accessToken,options)
 .cookie("refreshToken",refreshToken,options)
 .json(
  new ApiResponse(
    200,
    {
      user: loggedInUser , accessToken, refreshToken
    },
    "User logged in successfully"
  ))
  
})

const logoutUser = asyncHandler(async (req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set : { 
        refreshToken : undefined
      }
    },
    {
      new : true
    }
  )
  const options={
    hhtpOnly:true,
    secure:true
   }

   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(
    new ApiResponse(200,{},"User logged Out")
   )
})

export {
  registerUser,
  loginUser,
  logoutUser
}