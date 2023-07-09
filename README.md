# rn-html-to-pdf

''

## Installation

```sh
npm install rn-html-to-pdf
```

## Usage

```js
import * as React from 'react';

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { mergePdf, convert, createPDFFromImages } from 'rn-html-to-pdf';
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';

import Pdf from 'react-native-pdf';
import { ActivityIndicator } from 'react-native';

const uri =
  'https://raw.githubusercontent.com/iyegoroff/react-native-image-filter-kit/master/img' +
  '/parrot.png';

const style = { width: 320, height: 320 };

const image = <Image style={style} source={{ uri }} />;

export default function App() {
  const [result, setResult] = React.useState();
  const [pdf, setPdf] = React.useState();

  // React.useEffect(() => {
  //   multiply(3, 7).then(setResult);
  // }, []);

  const takePicture = async () => {
    try {
      setPdf(null);

      // const pickerResult = await DocumentPicker.pickMultiple({
      //   presentationStyle: 'fullScreen',
      //   copyTo: 'cachesDirectory',
      // });
      // // const pickerResult = await DocumentPicker.pickSingle({
      // //   presentationStyle: 'fullScreen',
      // //   copyTo: 'cachesDirectory',
      // // });

      // console.log({ pickerResult });

      // const resFile = await mergePdf({
      //   files: pickerResult.map((file) =>
      //     Platform.select({
      //       ios: file.fileCopyUri.replace('file://', ''),
      //       android: file.fileCopyUri.replace('file://', ''),
      //     })
      //   ),
      //   // filePath: undefined,
      // });

      // // setPdf(pickerResult.fileCopyUri);
      // setPdf(resFile.filePath);

      // console.log({ resFile });
      // return;
      const response = await MultipleImagePicker.openPicker({
        usedCameraButton: true,
        mediaType: 'image',
        singleSelectedMode: true,
        isPreview: false,
        maxSelectedAssets: 500,
      });

      // setResult(
      //   Platform.select({
      //     ios: response.path,
      //     android: `file://${response.realPath}`,
      //   })
      // );
      // const base64 = await ImgToBase64.getBase64String(response.path);

      // setResultCrop(image);

      // const ress = await createPDFFromImages(
      //   response.map((item) => `file://${item.realPath}`)
      // );

      const paramss = {
        pages: new Array(1).fill(0).map((_, index) => ({
          image: Platform.select({
            ios: response.path,
            android: `file://${response.realPath}`,
          }),
          title: `Trang số ${index + 1}`,
          content: 'test content',
        })),
        fileName: 'test2',
        isPaginate: true,
        padding: 40,
        fontName: 'Roboto',
        menuTitle: 'Danh mục ghi chú',
      };
      // console.log({ paramss: JSON.stringify(paramss) });
      const ress = await createPDFFromImages(paramss);
      setPdf(ress.filePath);
      console.log({ ress });
      return;

      //html to pdf
      console.log('response', response);

      // setLoading(true);
      let newDataImages = response.map((item) =>
        Platform.select({
          ios: item.path,
          android: `file://${item.realPath}`,
        })
      );

      // let newDataImages = new Array(1000)
      //   .fill(0)
      //   .map((item) => `file://${response.realPath}`);

      let html = '';

      newDataImages.map((image, index) => {
        html += `<div class="page">
        <img class="image" src="${image}" />
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
            bottom:${Platform.select({ ios: '-20px', android: '-5px' })}; 
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
        base64: false,
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
          horizontal={true}
          fitPolicy={2}
          spacing={0}
          trustAllCerts={false}
          enablePaging
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
  image: {
    width: 520,
    height: 520,
    marginVertical: 10,
    alignSelf: 'center',
  },
  filterSelector: {
    width: 100,
    height: 100,
    margin: 5,
  },
  filterTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
});
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
