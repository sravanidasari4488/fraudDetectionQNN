import { TextInput } from 'react-native';

export default function AppTextInput(props) {
  const { style, ...rest } = props;
  return <TextInput {...rest} style={[{ fontFamily: 'Poppins_400Regular' }, style]} />;
}
