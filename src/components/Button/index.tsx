import React from 'react';
import { colors } from '../../theme/colors';
import * as S from './styles';

type ButtonProps = {
  children: React.ReactNode;
  background: keyof typeof colors;
  style: 'filled' | 'bezeled';
  size: 'small' | 'large';
};

const Button = ({ children, background, style, size }: ButtonProps) => {
  return (
    <S.ButtonElement $background={background} $buttonStyle={style} $size={size}>
      {children}
    </S.ButtonElement>
  );
};

export default Button;
