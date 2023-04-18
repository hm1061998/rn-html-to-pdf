import * as React from 'react';

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Image,
  FlatList,
  DeviceEventEmitter,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import { mergePdf, convert, createPDFFromImages } from 'rn-html-to-pdf';
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';
import FileViewer from 'react-native-file-viewer';
import Pdf from 'react-native-pdf';
import { ActivityIndicator } from 'react-native';
import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  isInProgress,
  types,
} from 'react-native-document-picker';
import {
  AdenCompat,
  _1977Compat,
  BrannanCompat,
  BrooklynCompat,
  ClarendonCompat,
  EarlybirdCompat,
  GinghamCompat,
  HudsonCompat,
  InkwellCompat,
  KelvinCompat,
  LarkCompat,
  LofiCompat,
  MavenCompat,
  MayfairCompat,
  MoonCompat,
  NashvilleCompat,
  PerpetuaCompat,
  ReyesCompat,
  RiseCompat,
  SlumberCompat,
  StinsonCompat,
  ToasterCompat,
  ValenciaCompat,
  WaldenCompat,
  WillowCompat,
  Xpro2Compat,
  Emboss,
  Sharpen,
  Brightness,
  Polaroid,
  Threshold,
  ImageFilter,
  ToBGR,
  Kodachrome,
  Browni,
  ColorTone,
  EdgeDetection,
  FuzzyGlass,
  BoxBlur,
  GaussianBlur,
  LightenBlend,
  ColorDodgeBlend,
  ConvolveMatrix5x5,
  Achromatomaly,
  Contrast,
  SaturationBlend,
} from 'react-native-image-filter-kit';

const RNFS = require('react-native-fs');

const NoSadow = ({ image, disableCache }) => {
  return (
    <Brightness
      disableCache={disableCache}
      amount={3} // tăng độ sáng cho ảnh
      image={<Sharpen disableCache={disableCache} amount={1.5} image={image} />}
    />
  );
};

const PoprocketStandalone = ({ image, disableCache }) => (
  <Brightness
    disableCache={disableCache}
    amount={1.5}
    image={
      <Contrast
        disableCache={disableCache}
        amount={1.6}
        image={
          <Sharpen disableCache={disableCache} amount={1.2} image={image} />
        }
      />
    }
  />
);

const FILTERS = [
  {
    title: 'Normal',
    filterComponent: AdenCompat,
  },
  {
    title: 'NoSadow',
    filterComponent: NoSadow,
  },

  {
    title: 'Brightness',
    filterComponent: Brightness,
  },

  {
    title: 'PoprocketStandalone',
    filterComponent: PoprocketStandalone,
  },
  {
    title: 'Sharpen',
    filterComponent: Sharpen,
  },
  {
    title: 'Maven',
    filterComponent: MavenCompat,
  },
  {
    title: 'Emboss',
    filterComponent: Emboss,
  },
  {
    title: 'Mayfair',
    filterComponent: MayfairCompat,
  },
  {
    title: 'Moon',
    filterComponent: MoonCompat,
  },
  {
    title: 'Nashville',
    filterComponent: NashvilleCompat,
  },
  {
    title: 'Perpetua',
    filterComponent: PerpetuaCompat,
  },
  {
    title: 'Reyes',
    filterComponent: ReyesCompat,
  },
  {
    title: 'Rise',
    filterComponent: RiseCompat,
  },
  {
    title: 'Slumber',
    filterComponent: SlumberCompat,
  },
  {
    title: 'Stinson',
    filterComponent: StinsonCompat,
  },
  {
    title: 'Brooklyn',
    filterComponent: BrooklynCompat,
  },
  {
    title: 'Earlybird',
    filterComponent: EarlybirdCompat,
  },
  {
    title: 'Clarendon',
    filterComponent: ClarendonCompat,
  },
  {
    title: 'Gingham',
    filterComponent: GinghamCompat,
  },
  {
    title: 'Hudson',
    filterComponent: HudsonCompat,
  },
  {
    title: 'Inkwell',
    filterComponent: InkwellCompat,
  },
  {
    title: 'Kelvin',
    filterComponent: KelvinCompat,
  },
  {
    title: 'Lark',
    filterComponent: LarkCompat,
  },
  {
    title: 'Lofi',
    filterComponent: LofiCompat,
  },
  {
    title: 'Toaster',
    filterComponent: ToasterCompat,
  },
  {
    title: 'Valencia',
    filterComponent: ValenciaCompat,
  },
  {
    title: 'Walden',
    filterComponent: WaldenCompat,
  },
  {
    title: 'Willow',
    filterComponent: WillowCompat,
  },
  {
    title: 'Xpro2',
    filterComponent: Xpro2Compat,
  },
  {
    title: 'Aden',
    filterComponent: AdenCompat,
  },
  {
    title: '_1977',
    filterComponent: _1977Compat,
  },
  {
    title: 'Brannan',
    filterComponent: BrannanCompat,
  },
];

const uri =
  'https://raw.githubusercontent.com/iyegoroff/react-native-image-filter-kit/master/img' +
  '/parrot.png';

const style = { width: 320, height: 320 };

const image = <Image style={style} source={{ uri }} />;

export default function App() {
  const [result, setResult] = React.useState();
  const [pdf, setPdf] = React.useState();
  const extractedUri = React.useRef(
    'https://www.hyundai.com/content/hyundai/ww/data/news/data/2021/0000016609/image/newsroom-0112-photo-1-2021elantranline-1120x745.jpg'
  );
  const [selectedFilterIndex, setIndex] = React.useState(0);

  // console.log('NativeModules', NativeModules.RnHtmlToPdf);
  const onExtractImage = ({ nativeEvent }) => {
    console.log('uri', nativeEvent.uri);
    extractedUri.current = nativeEvent.uri;
  };
  const onSelectFilter = (selectedIndex) => {
    setIndex(selectedIndex);
  };
  const renderFilterComponent = ({ item, index }) => {
    const FilterComponent = item.filterComponent;
    const image = (
      <Image
        style={styles.filterSelector}
        source={{ uri: result }}
        resizeMode={'contain'}
      />
    );
    return (
      <TouchableOpacity onPress={() => onSelectFilter(index)}>
        <Text style={styles.filterTitle}>{item.title}</Text>
        <FilterComponent image={image} amount={1.5} />
      </TouchableOpacity>
    );
  };
  const SelectedFilterComponent = FILTERS[selectedFilterIndex].filterComponent;

  // React.useEffect(() => {
  //   multiply(3, 7).then(setResult);
  // }, []);

  const takePicture = async () => {
    try {
      setPdf(null);

      const pickerResult = await DocumentPicker.pickMultiple({
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      });
      // const pickerResult = await DocumentPicker.pickSingle({
      //   presentationStyle: 'fullScreen',
      //   copyTo: 'cachesDirectory',
      // });

      console.log({ pickerResult });

      const resFile = await mergePdf({
        files: pickerResult.map((file) =>
          Platform.select({
            ios: file.fileCopyUri.replace('file://', ''),
            android: file.fileCopyUri.replace('file://', ''),
          })
        ),
        filePath: undefined,
      });

      // setPdf(pickerResult.fileCopyUri);
      setPdf(resFile.filePath);

      console.log({ resFile });
      return;
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
        pages: new Array(30).fill(0).map((_, index) => ({
          image: Platform.select({
            ios: response.path,
            android: `file://${response.realPath}`,
          }),
          title: `Trang số ${index + 1}`,

          // content: 'fhdsofhsahfsa',
          content: `Trúc Sơn huyện cảnh nội trên sông Đỗ, một chiếc thuyền gỗ nhỏ chính dọc theo dòng sông một đầu chật hẹp dòng chảy chậm rãi tiến lên.

          Chu vi sơn thủy tú lệ phong cảnh hợp lòng người, tại cái này toàn quốc nhiệt độ cao phá trần giữa hè, nhiệt độ còn là thoải mái hơn hai mươi độ, nhượng đứng ở đầu thuyền Dịch Thư Nguyên không khỏi trong lòng thầm than khó trách « đào hoa nguyên ký » chỗ ghi là theo cái này xuất phát tìm tới thế ngoại đào nguyên.

          Rất nhiều người cho là Thường Đức ngang ngửa với cổ đại Vũ Lăng, nhưng kỳ thật tại Tấn Thái Nguyên thời kì, Trung Quốc bản đồ bên trên gọi Vũ Lăng địa phương chỉ có hiện tại Trúc Sơn huyện, lúc đó gọi Vũ Lăng huyện, thuộc về Thượng Dung quận, thuyền nhỏ phía dưới sông Đỗ liền là lúc đó Vũ Lăng sông, cũng là Dịch Thư Nguyên nhiều năm như vậy vẫn luôn nghĩ đến địa phương.

          Tại cái này sơn thủy tầm đó, Dịch Thư Nguyên đại nhập cảm gợi lên sách nghiện, tại nội tâm tưởng tượng thấy một loại nào đó hình tượng, nuốt giọng khí tức biến đổi, dùng tâm cảnh bên trong tâm tình mở miệng.

          "Tấn ~ Thái Nguyên bên trong, Vũ Lăng người bắt cá là nghiệp. Men theo suối đi, quên đường xa gần. Chợt gặp rừng hoa đào, giáp bờ mấy trăm bước, bên trong không cây tạp, cỏ thơm tươi đẹp, hoa rụng sặc sỡ. . ."

          Dịch Thư Nguyên tựa như đắm chìm tại « đào hoa nguyên ký » ý cảnh bên trong, âm thanh trong trẻo mà hữu lực.

          Tại Dịch Thư Nguyên trong đầu phảng phất khắc hoạ ra Tấn Thái Nguyên thời kì, một tên ngư nhân chèo thuyền du ngoạn trên nước khoan thai tiến lên hình tượng, một giáp tiếng phổ thông tiêu chuẩn lại thêm chính hắn tâm tình nhuộm đẫm cùng tưởng tượng ý cảnh, ngón tay khoan thai chỉ hướng bên bờ, tựa như nơi đó hóa ra từng cây từng cây cây đào. . .

          Đuôi thuyền vạch lên thuyền đại gia nghe đến đều có chút nhập thần, thậm chí theo bản năng thuận theo Dịch Thư Nguyên ngón tay phương hướng nhìn tới, đương nhiên cũng không nhìn đến cái gì cây đào.

          Dịch Thư Nguyên lúc này chính tại uẩn nhưỡng tâm tình đây, chèo thuyền đại gia cho là hắn niệm xong, không nhịn được tựu tiếp lời.

          "Tiểu hỏa tử, ngươi rất vững chắc nha, âm thanh quái dễ nghe, là làm công việc gì a?"

          Dịch Thư Nguyên bất đắc dĩ quay đầu nhìn hướng phía sau, chỉ chỉ trên đầu mang theo vận động máy ảnh.

          "Đại gia, ta trên mạng kiếm cơm, ngươi coi ta là kể chuyện tốt."

          Chèo thuyền đại gia bừng tỉnh hiểu ra.

          "Ah ah úc! Ngươi chính là, liền là loại kia hiện tượng mạng a?"

          Nghe nói như thế, Dịch Thư Nguyên cười một cái tự giễu.

          Kể chuyện cùng kỹ thuật miệng kết hợp, một người diễn dịch ra trong sách hết thảy đặc sắc, thời cổ đến nay số ít kể chuyện nghệ thuật đại gia tại đạo này có bất phàm tạo nghệ, cho đến hôm nay không thể nói hoàn toàn đoạn tuyệt nhưng cũng khó tìm tung tích.

          Mà Dịch Thư Nguyên chí hướng chính là ở đây, hắn từng cho là mình thiên phú dị bẩm, nhất định có thể có thành tựu, công tác mấy năm sau dứt khoát từ chức, dùng mộng tưởng làm bản gốc hiến thân mới truyền thông ngành nghề.

          Nhưng nỗ lực cũng không nhất định liền sẽ thành công, mà các loại AI thanh âm xuất hiện cũng đem Dịch Thư Nguyên lòng tin đánh sụp, bây giờ tới nơi này đi khắp toàn quốc về sau, cũng kém không nhiều nên từ trong mộng đi đến cuộc sống thực tế.

          "Đại gia, ta chính là tùy tiện vui đùa một chút, cùng hiện tượng mạng không đáp biên, ngài cảm thấy dễ nghe ta vậy ta nói tiếp, phía sau còn có đây này!"

          Nói đến châm chọc, Dịch Thư Nguyên cảm giác mình danh tiếng vang nhất thời điểm thế mà còn là tại đại học.

          Bất quá cũng không phải cái gì tốt danh tiếng, mà là bị toàn trường thông báo nhóm, lần kia Dịch Thư Nguyên ký túc xá đều uống say, bị hắn lôi kéo ở trường thư viện tường trắng bên ngoài xoát một trang bắt mắt ép dầu từ, từ đây Dịch Thư Nguyên "Tiên nhân, thần côn" ngoại hiệu truyền khắp toàn trường, liền phụ đạo viên đều đi theo gọi.

          "Muốn đến oa muốn đến oa!"

          Chèo thuyền đại gia âm thanh đánh gãy Dịch Thư Nguyên ngắn ngủi hồi ức, cái sau thu thập tâm tình hít thở sâu một hơi, lần nữa uẩn nhưỡng tâm tình, xoay người nhìn về phía trước, tưởng tượng ra trong lòng thần kỳ.

          "Ngư nhân cái gì khác, lại tiến lên, muốn nghèo hắn lâm. . . Lâm tận thượng nguồn, liền đến một núi, núi có miệng nhỏ, phảng phất. . . Như ~ có ~ ánh sáng. . ."

          Dịch Thư Nguyên âm thanh biến chậm lại, hắn có chút mở to hai mắt, con ngươi không kìm được chậm rãi mở lớn, trong thoáng chốc hắn tựa như thật ảo giác nhìn đến hoàn toàn mông lung ánh sáng ngay tại phía trước.

          "Phanh ~ "

          Thuyền nhỏ đụng đột nhiên đụng phải đồ vật gì, Dịch Thư Nguyên bất ngờ không đề phòng liền cái phản ứng đều không có, "A" một tiếng liền tại đuôi thuyền đại gia tiếng kinh hô bên trong rơi vào mặt sông.

          "Phù phù ~ "

          Tại rơi sông trong nháy mắt đó, Dịch Thư Nguyên tựa như nhìn thấy cái gì đồ vật đụng phải thuyền, cái kia tựa hồ, là một phiến lớn. . . Băng?

          Sau một khắc, Dịch Thư Nguyên tựu bị vô số nước chảy thấm ngập, hắn giãy dụa lấy vẩy nước càng không cách nào hiện lên, thậm chí càng là vẩy nước trầm đến càng nhanh, phảng phất trên thân cột lấy khối chì, rơi hướng trong nước một phiến vô cùng kinh khủng sâu thẳm âm u, như là một trương muốn đem hắn thôn phệ miệng lớn.

          "Ô ô ô phốc lỗ. . . Ô phốc phốc. . ."

          Hiện trạng mang tới hoảng loạn sợ hãi nhượng Dịch Thư Nguyên càng khó nín thở, vô số bong bóng theo Dịch Thư Nguyên trong miệng tràn ra.

          Dưới thân thể trầm tốc độ càng lúc càng nhanh, Dịch Thư Nguyên trong miệng không biết rót bao nhiêu nước bọt, ý thức đều trở nên lại không rõ ràng, trừ trên thân thể ngạt thở cảm giác, chung quanh nước tựa hồ cũng đang trở nên càng ngày càng lạnh, hắn giãy dụa cũng yếu ớt xuống dưới.

          'Thật là khó chịu, lạnh quá, chẳng lẽ ta muốn chết?'

          Âm u bên trong phảng phất xuất hiện từng đạo mông lung lưu quang, tại Dịch Thư Nguyên mê man ánh mắt phía trước chạy loạn, mà trong đầu của hắn càng là như là như đèn kéo quân xẹt qua từng đoạn hồi ức hình tượng, thậm chí sản sinh một chút ảo giác, có bóng người, có sách văn, có âm thanh, có áo dài cùng giáp trụ các loại hoặc quen thuộc hoặc xa lạ chính mình. . .

          Mà hết thảy này giống như là trong đầu lại giống là ở trước mắt, đều phảng phất muốn theo sinh mệnh của mình đồng dạng cách Dịch Thư Nguyên mà đi, theo trên thân hóa thành từng đạo chỉ riêng bay đi.

          Giờ khắc này, Dịch Thư Nguyên bản năng muốn đưa tay chụp vào tất cả những thứ này, cái kia khuấy động lưu quang thật giống như bị hắn chộp vào đầu ngón tay.

          Ầm ầm ầm. . .

          Lưu quang đung đưa, đầu ngón tay run rẩy không ngừng, Dịch Thư Nguyên trong lòng phảng phất kịch chấn, nhượng hắn có loại muốn bị xé rách cảm giác sợ hãi.

          Tâm thần dao động một khắc này, vô số điểm sáng trong phút chốc nổ tung, lưu quang như tia đoạn mà qua nhanh.

          Ầm ầm ~

          Trùng kích nhượng dòng nước không ngừng xoay tròn, vô số tinh điểm bay vụt tiêu tán, Dịch Thư Nguyên đầu ngón tay sót lại lưu quang chợt lóe lên, cả người hắn cũng ở trong nước lật qua lật lại, hình tượng càng ngày càng mơ hồ.

          "Đùng. . ."

          Dịch Thư Nguyên đầu não dập đến cái gì, người đột nhiên theo mê man bên trong tỉnh táo lại, trong lúc hốt hoảng lung tung vẩy nước, lập tức ngạc nhiên phát hiện, loại kia bị không ngừng cuốn vào trói buộc không còn!

          Cái này nào còn chú ý tới mặt khác, Dịch Thư Nguyên chỉ dám hướng ngăm đen dưới nước nhìn thoáng qua, tựu ra sức vẩy nước nổi lên, nghẹt thở mãnh liệt thống khổ nhượng hắn hình thái điên cuồng.

          "Phanh ~ "

          Dịch Thư Nguyên đầu đụng phải cái gì, tại một trận "Ào ào ào" tiếng nước bên trong, thân thể của hắn lại theo một cái tách ra hai nửa vết nứt bên trong chui ra mặt nước.

          "Ôi. . . Ôi, ôi, khụ khụ. . . Cứu, cứu mạng. . ."

          Dịch Thư Nguyên vừa hô vừa sờ loạn, trong hỗn loạn mới hiểu được bên cạnh mình lại là từng mảnh từng mảnh băng nổi, chính là lay động đến kịch liệt, căn bản nằm sấp không được.

          Băng? Làm sao sẽ có băng? Nhưng lúc này Dịch Thư Nguyên không rảnh nghĩ nhiều, hắn phát hiện bên bờ không xa, lại ra sức đá lấy thủy du đi qua, chính là hắn hiện tại đã thể lực chống đỡ hết nổi tứ chi cứng ngắc, miễn cưỡng nằm sấp ở bên bờ nhưng căn bản không khí lực lên tới, chỉ có thể dùng cóng đến run rẩy miệng không ngừng kêu cứu.

          "Ôi, ôi. . . . . Có, có người sao, cứu mạng —— "

          Nhưng lọt vào trong tầm mắt là cánh rừng xen lẫn tuyết đọng, nắng chiều chiếu sáng lòng chảo sông, như là một phiến lác đác không có người ở hoang sơn lão lâm, nhượng Dịch Thư Nguyên tâm so nước đá còn lạnh.

          Nhưng nơi này kỳ thật thật có người.

          Tại bên bờ cách đó không xa mấy khỏa phía sau đại thụ tựu che giấu một đám người, một người trong đó gặp trong sông tình cảnh, do dự một chút chính muốn đi ra, lại bị người bên cạnh dùng giữ chặt.

          "Nhượng hắn lại giãy giụa một hồi, giãy giụa đến càng lợi hại càng tốt, súc sinh kia ưa thích sống."

          Liền là, một đám người lại lẳng lặng đợi một hồi, nhìn lấy Dịch Thư Nguyên ở bên kia tuyệt vọng giãy dụa, mắt thấy hắn động tĩnh càng ngày càng nhỏ, vừa mới người nói chuyện cũng không giữ được bình tĩnh.

          "Đại ca, xem ra hôm nay sẽ không tới."

          Trong ngôn ngữ, người này nhìn đến đại ca gật đầu, lập tức hướng bờ sông chạy tới, mấy bước tầm đó đã đến bên bờ, tại Dịch Thư Nguyên kinh hỉ trong ánh mắt, đưa tay bắt lấy hắn cánh tay.

          "Sột soạt ~ "

          Chính là nhấc lên, ngâm tại trong nước đá Dịch Thư Nguyên tựu bị người đến xách ra mặt nước. . .

          "Cám, cám ơn. . ."

          Dịch Thư Nguyên bị đông đến cơ hồ nói không ra lời, mà cứu Dịch Thư Nguyên người tắc toét ra miệng, quay đầu đối sau lưng qua tới mọi người cười nói.

          "Hắn còn phải cảm ơn ta?"

          "Ha ha ha ha ha. . ." "A ha ha ha ha. . ."

          Bên kia truyền tới một phiến cười vang. Hãy nhấn like ở mỗi chương để ủng hộ tinh thần các dịch giả bạn nhé!`,
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

  // return (
  //   <>
  //     <View />
  //     {selectedFilterIndex === 0 ? (
  //       <Image
  //         style={styles.image}
  //         source={{ uri: result }}
  //         resizeMode={'contain'}
  //       />
  //     ) : (
  //       <SelectedFilterComponent
  //         onExtractImage={onExtractImage}
  //         onFilteringError={(e) => {
  //           console.log({ e });
  //         }}
  //         extractImageEnabled={true}
  //         amount={1.5}
  //         image={
  //           <Image
  //             style={styles.image}
  //             source={{ uri: result }}
  //             resizeMode={'contain'}
  //           />
  //         }
  //       />
  //     )}
  //     <FlatList
  //       data={FILTERS}
  //       keyExtractor={(item) => item.title}
  //       horizontal={true}
  //       renderItem={renderFilterComponent}
  //     />

  //     <TouchableOpacity
  //       style={{ paddingVertical: 10, paddingHorizontal: 10 }}
  //       onPress={takePicture}
  //     >
  //       <Text>pick image</Text>
  //     </TouchableOpacity>
  //   </>
  // );

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
