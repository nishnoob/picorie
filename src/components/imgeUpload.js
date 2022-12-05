import AWS from 'aws-sdk'

const S3_BUCKET ='album-hosting.amirickbolchi.com';
const REGION ='ap-south-1';
const ACCESS_KEY ='AKIAZYOZLCQKSJJAIVPN';
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

const UploadImageToS3 = (file, filepath, cb) => {
  var blobData = dataURItoBlob(file);
  const params = {
    Body: blobData,
    Bucket: S3_BUCKET,
    Key: filepath,
    ContentType: 'image/jpeg',
    ACL: 'public-read',
  };

  return myBucket.putObject(params)
    .on('complete', (evt) => {
      cb();
      // setProgress(Math.round((evt.loaded / evt.total) * 100))
    })
    .send((err) => {
        if (err) console.log(err)
    })
}

export default UploadImageToS3;