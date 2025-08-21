import React from 'react';
import StructNative from './Struct.native';

import type { StructProps } from '../types/field.types';

const Struct = (props: StructProps) => {
  const Template = props.ctx?.templates?.struct ?? StructNative;
  return <Template {...props} />;
};

export default Struct;
