import React from 'react';
import styled,{css} from 'styled-components';

const YScroll = styled.div`
    scrollbar-color:rgba(105,112,125,.5) transparent;
    scrollbar-width:thin;
    ${props => !props.height && css`height: 100%;`}
    ${props => props.maxHeight && css`max-height: ${props.maxHeight};`}
    ${props => props.height && css`height: ${props.height};`}
    ${props => props.width && css`width: ${props.width};`}
    overflow-y:auto;
    overflow-x:${props => props.xScroll ? props.xScroll : "hidden"};
    -webkit-mask-image:linear-gradient(180deg,rgba(255,0,0,.1) 0 7.5px calc(100%-7.5px),rgba(255,0,0,.1));
    mask-image:linear-gradient(180deg,rgba(255,0,0,.1) 0 7.5px calc(100%-7.5px),rgba(255,0,0,.1));
    &::-webkit-scrollbar {
      width:16px;
      height:16px;
    }
    &::-webkit-scrollbar-thumb{
      background-color:rgba(105,112,125,.5);
      background-clip:content-box;
      border-radius:16px;
      border:6px solid transparent;
    }
    &::-webkit-scrollbar-corner{
      background-color:transparent;
    }
    &:focus {
        outline: none;
    }
    &:focus:focus-visible{
      outline-style:auto;
    }    
`;

export default React.forwardRef(({ children, ...props }, ref) => (
  <YScroll ref={ref} {...props} >{children}</YScroll>
));