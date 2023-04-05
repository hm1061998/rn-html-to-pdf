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

export default function App() {
  const [result, setResult] = React.useState();

  React.useEffect(() => {
    multiply(3, 7).then(setResult);
  }, []);

  const takePicture = async () => {
    try {
      // const granted = await PermissionsAndroid.request(
      //   PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      //   {
      //     title: 'Cool Photo App Camera Permission',
      //     message:
      //       'Cool Photo App needs access to your camera ' +
      //       'so you can take awesome pictures.',
      //     buttonNeutral: 'Ask Me Later',
      //     buttonNegative: 'Cancel',
      //     buttonPositive: 'OK',
      //   }
      // );

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
      width:100%;
      height:100%;
      position: relative; 
      display: flex; 
      align-items: center;
      justify-content: center;
      box-sizing: border-box; `;

      const imageStyle = `
      width: 100%;
      height:100%;
      object-fit: contain;`;

      let html = '';

      new Array(1).fill(0).map((image) => {
        html += `<div style="${containerStyle}">
        <img style="${imageStyle}" src="${filePath}" />
        </div>`;
      });

      html = `
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
      </head>
      <body >
      ${html}
      </body>
    </html>

      `;
      // setLoading(true);
      // const res = await getResultImage(filePath);
      // setLoading(false);
      // setresultImage(res);
      const res = await convert({ html, fileName: 'test' });

      // console.log({ response });
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});