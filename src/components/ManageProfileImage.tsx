import { IKImage, IKUpload } from "imagekitio-react";
import { useState } from "react";

// required parameter to fetch images
const ImagekitID = "madrealities";
// optional parameters (needed for client-side upload)
const authenticationEndpoint = "https://www.your-server.com/auth";

export default function ManageProfileImage() {
  const [imageId, setImageId] = useState("");
  const [imagePath, setImagePath] = useState("");

  const onError = (err: any) => {
    console.log("Error", err);
  };

  const onSuccess = (res: any) => {
    console.log("Success", res);
  };

  return (
    <div>
      Manage Profile Image
      <br />
      {imageId}
      <br />
      {imagePath && (
        <IKImage
          transformation={[
            {
              height: "300",
              width: "300",
            },
          ]}
          loading="lazy"
          lqip={{ active: true }}
          path={imagePath}
          height="300"
          width="300"
        />
      )}
      <p>Upload an image</p>
      <IKUpload
        fileName="test-upload.png"
        onError={onError}
        onSuccess={(res) => {
          setImageId(res.fileId);
          setImagePath(res.filePath);
        }}
      />
    </div>
  );
}
