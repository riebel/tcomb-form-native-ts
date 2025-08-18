import StructNative from './Struct.native';

import type { StructTemplateProps } from '../types/template.types';

const Struct = (props: StructTemplateProps) => {
  // Default to the native implementation
  return <StructNative {...props} />;
};

export default Struct;
