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
      console.log('response', response);

      // setLoading(true);
      const filePath = Platform.select({
        ios: response.path,
        android: `file://${response.realPath}`,
      });

      let html = '';

      new Array(10).fill(0).map((image, index) => {
        html += `<div class="page">
        <img class="image" src="${filePath}" />
        <p class="pagi">${index + 1}</p>
        </div>`;
      });

      // html += `<div style="${containerStyle}">
      // <img style="${imageStyle}" src="${filePath}" />
      // </div>`;

      html = `
      <html>
      <head>

        <style>
          @page {
              margin: 0;
              size: A4 portrait;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .page {
            width:595pt;
            height:842pt;
            margin:0;
            padding: 10px;
            position: relative; 
            display: flex; 
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            background-color: white;
            page-break-after: always;
          }
          .image {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .pagi {
            text-align: center; 
            width:100%; 
            font-size: 26px; 
            position:absolute; 
            bottom:-15px; 
            left:0
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
      const res = await convert({
        html,
        fileName: 'test2',
        width: 595,
        height: 842,
      });
      setPdf(res.filePath);
      console.log({ res });
    } catch (e) {
      console.log('e', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>

      <TouchableOpacity onPress={takePicture}>
        <Text>pick image</Text>
      </TouchableOpacity>
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
    backgroundColor: 'green',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
