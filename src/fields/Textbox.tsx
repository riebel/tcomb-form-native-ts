import NativeTextbox from './Textbox.native';

export { getLocals } from './Textbox.native';

class Textbox extends NativeTextbox {
  static ReactComponent = NativeTextbox.ReactComponent;
}

export default Textbox;
