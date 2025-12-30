import Text from "../ui/Text"

export default function AppText(props) {
  const { style, children, ...rest } = props;
  return (
    <Text {...rest} style={[{ fontFamily: 'Poppins_400Regular' }, style]}>
      {children}
    </Text>
  );
}
