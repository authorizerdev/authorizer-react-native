import { StyleSheet } from 'react-native';
// import { Views } from '../constants';

type StyleProps = {
  view?: string;
  downshiftProps?: {
    class: string;
    innerStyle: any;
  };
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
};

export const styles = (props: StyleProps = {}) => {
  let innerProps: Record<string, Record<string, string | number>> = {
    flex: {
      display: 'flex',
      flexDirection: props.flexDirection ? props.flexDirection : 'column',
      justifyContent: props.justifyContent ? props.justifyContent : 'center',
      alignItems: props.alignItems ? props.alignItems : 'center',
    },
    wrapper: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
  };
  // if (props.view === Views.Login) {

  // }
  if (props.downshiftProps?.class) {
    if (innerProps[props.downshiftProps.class]) {
      innerProps[props.downshiftProps.class] = {
        ...innerProps[props.downshiftProps.class],
        ...props.downshiftProps?.innerStyle,
      };
    } else {
      innerProps[props.downshiftProps.class] = props.downshiftProps?.innerStyle;
    }
  }
  return StyleSheet.create({ ...innerProps });
};
