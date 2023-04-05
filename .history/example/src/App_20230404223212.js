import * as React from 'react';

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { multiply, convert } from 'rn-html-to-pdf';
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';
import FileViewer from 'react-native-file-viewer';
import Pdf from 'react-native-pdf';
import { ActivityIndicator } from 'react-native';

export default function App() {
  const [result, setResult] = React.useState();
  const [pdf, setPdf] = React.useState();

  React.useEffect(() => {
    multiply(3, 7).then(setResult);
  }, []);

  const takePicture = async () => {
    try {
      setPdf(null);

      const response = await MultipleImagePicker.openPicker({
        usedCameraButton: true,
        mediaType: 'image',
        singleSelectedMode: true,
        isPreview: false,
      });
      // const base64 = await ImgToBase64.getBase64String(response.path);

      // setResultCrop(image);
      // console.log('data',corners);

      // setLoading(true);
      const filePath = Platform.select({
        ios: response.path,
        android: `file://${response.realPath}`,
      });

      const containerStyle = `
     
      position: relative; 
      display: flex; 
      align-items: center;
      justify-content: center;
      // box-sizing: border-box;
      background-color:blue;
      page-break-after: always;
       `;

      const imageStyle = `
      width: 100%;
      height:calc(100% - 500px);
      object-fit: contain;`;

      let html = '';

      new Array(10).fill(0).map((image, index) => {
        html += `<div style="${containerStyle}" class="page">
        <img style="${imageStyle}" src="${filePath}" />
        <p style="text-align: center; width:100%; font-size: 26px; position:absolute; bottom:0; left:0">${
          index + 1
        }</p>
        </div>`;
      });

      // html += `<div style="${containerStyle}">
      // <img style="${imageStyle}" src="${filePath}" />
      // </div>`;

      html = `
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          .page {
            width:100$;
            height:100$;
          }
        </style>
      </head>
      <body >
      ${html}
      </body>
    </html>

      `;

      // html = `<h1>My HTML document</h1>`;
      // setLoading(true);
      // const res = await getResultImage(filePath);
      // setLoading(false);
      // setresultImage(res);
      const res = await convert({ html, fileName: 'test2' });
      setPdf(`file://${res}`);
      console.log({ res });
    } catch (e) {
      console.log('e', e);
    }
  };

  return (
    <View style={styles.container}>
      {/* <Text>Result: {result}</Text>

      <TouchableOpacity onPress={takePicture}>
        <Text>pick image</Text>
      </TouchableOpacity> */}
      <View style={{ flex: 1, backgroundColor: 'yellow' }}>
        <Pdf
          source={{ uri: pdf }}
          horizontal={false}
          fitPolicy={2}
          spacing={0}
          trustAllCerts={false}
          // enablePaging
          renderActivityIndicator={() => (
            <ActivityIndicator color="green" size="large" />
          )}
          onLoadComplete={(num) => {
            console.log('num', num);
          }}
          // onPageChanged={page => {
          //   setCurrentPage(page);
          // }}
          onLoadProgress={(percentage) => {
            // console.log(percentage);
          }}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});