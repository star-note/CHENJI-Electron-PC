/* eslint-disable react/jsx-props-no-spreading */
import { useRef, useState } from 'react';
import { message, Modal, Slider, Upload } from 'antd';
import 'cropperjs/dist/cropper.css';
import Cropper, { ReactCropperElement } from 'react-cropper';
import { RcFile } from 'antd/es/upload/interface';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { Config } from '@/pages/publish/board/config';
import { getBase64 } from '@/utils';
import './index.less';
import { WidthSpace } from '../space';

const UploadInner = ({
  imageUrl,
  size,
  loading,
  placehodler,
}: {
  imageUrl?: string;
  size?: NonNullable<Config['dom']['rule']>['size'];
  loading?: boolean;
  placehodler?: string;
}) => {
  return imageUrl ? (
    <div
      style={{
        width: size?.width || '100px',
        height: size?.height || '100px',
        flexDirection: 'column',
      }}
      className="flex-center"
    >
      <img
        src={imageUrl}
        alt=""
        style={{
          width: size?.width || '100px',
        }}
      />
    </div>
  ) : (
    <div
      style={{
        width: size?.width || '100px',
        height: size?.height || '100px',
        flexDirection: 'column',
      }}
      className="flex-center"
    >
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>{placehodler}</div>
    </div>
  );
};
interface IUploadImg {
  placehodler?: Config['dom']['placeholder'];
  size?: NonNullable<Config['dom']['rule']>['size'];
  uploadImg: (img: File) => Promise<{ url: string }>;
  value?: string; // 自定义FormItem子组件则为受控，https://ant.design/components/form-cn#components-form-demo-customized-form-controls
  onChange?: (value: string) => void; // 自定义FormItem子组件需要onChange属性
}
export const UploadImg = (props: IUploadImg) => {
  const { placehodler, size, uploadImg, value, onChange } = props;
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [cropperOpen, setCropperOpen] = useState(false);
  const [srcCropper, setSrcCropper] = useState('');
  const cropperRef = useRef<ReactCropperElement>(null);
  const [zoomValue, setZoom] = useState(1);

  const beforeUpload = (file: RcFile) => {
    const isLt2M = file.size / 1024 / 1024 < (size?.maxBit || 1);
    if (!isLt2M) {
      message.error(`图片大小限制${size?.maxBit || 1}MB!`);
    }
    // return isLt2M;

    getBase64(file).then(url => {
      setCropperOpen(true);
      setSrcCropper(url);
    });
    return false; // 返回false,阻止文件上传
  };

  // const uploadImgFn = (options: UploadRequestOption) => {
  //   setLoading(true);
  //   uploadImg(options.file as File)
  //     .then(data => {
  //       console.log(55555, data);
  //       setLoading(false);
  //       setImageUrl(data.url);
  //     })
  //     .catch(err => {
  //       console.log(4444, err);
  //       setLoading(false);
  //     });
  // };

  const handleSaveImg = () => {
    cropperRef.current?.cropper.getCroppedCanvas().toBlob(blob => {
      setLoading(true);
      uploadImg(blob as File)
        .then(data => {
          // console.log(55555, data);
          setLoading(false);
          setCropperOpen(false);
          setImageUrl(data.url);
          onChange?.(data.url);
        })
        .catch(() => {
          setLoading(false);
        });
    });
  };

  // !!important 注意：任何样式修改，有FormItem和没有要保持一致，两边都要修改
  return (
    <>
      <Upload
        accept=".jpg,.jpeg,.png" // image/*
        listType="picture-card"
        className="img-uploader"
        showUploadList={false}
        beforeUpload={beforeUpload}
      >
        <UploadInner
          loading={loading}
          size={size}
          imageUrl={imageUrl || value}
          placehodler={placehodler}
        />
      </Upload>

      {/* 裁剪模态框 */}
      <Modal
        open={cropperOpen}
        width={820}
        title="请选择剪裁区域"
        onCancel={() => setCropperOpen(false)}
        destroyOnClose
        onOk={handleSaveImg}
        confirmLoading={loading}
      >
        <Cropper
          src={srcCropper || ''} // 图片路径，即是base64的值，在Upload上传的时候获取到的
          ref={cropperRef}
          preview=".uploadCrop"
          viewMode={1} // 定义cropper的视图模式
          zoomable // 是否允许放大图像
          rotatable
          guides={false} // 显示在裁剪框上方的虚线
          background={false} // 是否显示背景的马赛克
          autoCropArea={1} // 默认值0.8（图片的80%）。--0-1之间的数值，定义自动剪裁区域的大小
          style={{ width: '100%', height: '400px' }}
          aspectRatio={
            parseInt(String(size?.width), 10) /
            parseInt(String(size?.height), 10)
          } // 固定为1:1  可以自己设置比例, 默认情况为自由比例
          cropBoxResizable={false} // 默认true ,是否允许拖动 改变裁剪框大小
          cropBoxMovable={false} // 是否可以拖拽裁剪框 默认true
          dragMode="move" // 拖动模式, 默认crop当鼠标 点击一处时根据这个点重新生成一个 裁剪框，move可以拖动图片，none:图片不能拖动
          center
        />
        <div className="flex-center">
          {/* <UndoOutlined
            onClick={() => cropperRef.current?.cropper.rotate(-1)}
          /> */}
          <span>-180°</span>
          <WidthSpace />
          <Slider
            defaultValue={0}
            max={180}
            min={-180}
            onChange={value => cropperRef.current?.cropper.rotateTo(value)}
            style={{ width: 350 }}
          />
          <WidthSpace />
          <span>+180°</span>
          {/* <RedoOutlined onClick={() => cropperRef.current?.cropper.rotate(1)} /> */}
        </div>
        <div className="flex-center">
          {/* <MinusOutlined
            onClick={() => cropperRef.current?.cropper.zoom(-0.1)}
          /> */}
          <span>1</span>
          <WidthSpace />
          <Slider
            defaultValue={1}
            max={3}
            min={1}
            step={0.1}
            value={zoomValue}
            onChange={value => {
              cropperRef.current?.cropper.zoom(value - zoomValue);
              setZoom(value);
            }}
            style={{ width: 350 }}
          />
          <WidthSpace />
          <span>3</span>
          {/* <PlusOutlined onClick={() => cropperRef.current?.cropper.zoom(0.1)} /> */}
        </div>
      </Modal>
      {/* <Modal open={previewOpen} footer={null}>
        <img alt="" style={{ width: '100%' }} src={previewImage} />
      </Modal> */}
    </>
  );
};
