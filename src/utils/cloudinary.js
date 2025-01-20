import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY ,
  api_secret:  process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary=async (localFilePath) => {
  try {
    //checking if path exists
    if(!localFilePath) {
      return null;
    }
    //upload file on cloudinary
    const response=await cloudinary.uploader.upload(localFilePath,{
     resource_type:"auto"
    })
    //file has been uploaded successfully
    console.log("UTILS :: CLOUDINARY.JS :: FILE UPLOADED SUCCESFULLY ON CLOUDINARY :: ",response);
    fs.unlinkSync(localFilePath);
    return response
  } catch (error) {
    //remove locally saved temporary file as upload failed
    fs.unlinkSync(localFilePath)
    return null;
  }
}

export {uploadOnCloudinary}


