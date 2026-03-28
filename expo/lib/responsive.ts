import { Dimensions, PixelRatio } from 'react-native';

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const getSizes = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

export const scale = (size: number): number => {
  const { width } = getSizes();
  return (width / guidelineBaseWidth) * size;
};

export const verticalScale = (size: number): number => {
  const { height } = getSizes();
  return (height / guidelineBaseHeight) * size;
};

export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

export const fontScale = (size: number): number => {
  const scaled = moderateScale(size, 0.4);
  return PixelRatio.roundToNearestPixel(scaled);
};

export const spacing = (size: number): number => PixelRatio.roundToNearestPixel(moderateScale(size, 0.6));
export const radius = (size: number): number => PixelRatio.roundToNearestPixel(moderateScale(size, 0.5));
