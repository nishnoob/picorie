import AWS from 'aws-sdk'

const S3_BUCKET ='picorie-assets';
const REGION ='ap-south-1';
const ACCESS_KEY ='AKIAXBUZKGK6BS4XJR5P';
const SECRET_ACCESS_KEY ='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';

AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY
})

const myBucket = new AWS.S3({
    params: { Bucket: S3_BUCKET},
    region: REGION,
})

const dataURItoBlob = (dataURI) => {
  var binary = atob(dataURI.split(',')[1]);
  var array = [];
  for(var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
}

export const UploadImageToS3 = (file, filepath, cb) => {
  var blobData = dataURItoBlob(file);
  const params = {
    Body: blobData,
    Bucket: S3_BUCKET,
    Key: filepath,
    ContentType: 'image/jpeg',
    ACL: 'public-read',
  };

  return myBucket.putObject(params)
    .on('success', (evt) => {
      cb();
      // setProgress(Math.round((evt.loaded / evt.total) * 100))
    })
    .send((err) => {
        if (err) console.log(err)
    })
}

export const DeleteImageFromS3 = (filepath, cb) => {
  const params = {
    Bucket: S3_BUCKET,
    Key: filepath,
  };

  return myBucket.deleteObject(params)
    .on('success', (evt) => {
      cb();
      // setProgress(Math.round((evt.loaded / evt.total) * 100))
    })
    .send((err) => {
        if (err) console.log(err)
    })
}

// export default UploadImageToS3;