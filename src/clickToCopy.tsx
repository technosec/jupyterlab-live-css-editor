import React, { useState } from 'react';
import {
  IconSwitcher,
  LucideGridIcon,
  LucideLinkIcon,
  LucideListIcon
} from './svgs';
import { colorPaletteColors } from './colorPalette';
import CopyToClipboard from 'react-copy-to-clipboard';

export function Clipboards() {
  const [isCompact, setIsCompact] = useState(true);

  function changeViewTo(value) {
    setIsCompact(() => (value === 'grid' ? true : false));
  }
  return (
    <div className="css-editor-color-palette-wrapper">
      <div
        className="color-palette-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          background: 'var(--twindcolors-slate-950)',
          width: '100%',
          zIndex: '1',
          paddingTop: '15px'
        }}
      >
        <a
          href="https://tailwindcss.com/docs/customizing-colors"
          target="_blank"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            color: '#3b82f6',
            fontFamily: 'sans-serif'
          }}
        >
          <p className="tailwind-colors-link-text">tailwind colors</p>
          <LucideLinkIcon />
        </a>
        <div style={{ display: 'flex', gap: '10px' }}>
          <LucideGridIcon
            isActive={isCompact}
            onClick={() => changeViewTo('grid')}
          />
          <LucideListIcon
            isActive={!isCompact}
            onClick={() => changeViewTo('list')}
          />
        </div>
      </div>
      <div style={{ padding: '10px' }} className="color-palette-colors">
        <div style={{}}>
          <h3
            style={{
              textAlign: 'center',
              fontFamily: 'sans-serif',
              color: 'var(--twindcolors-slate-50)',
              margin: '0',
              marginTop: '10px'
            }}
          >
            Your Color Palette
          </h3>
          <p
            style={{
              textAlign: 'center',
              fontFamily: 'sans-serif',
              color: 'var(--twindcolors-slate-500)',
              margin: '10px',
              marginBottom: '24px'
            }}
          >
            Click to copy into clipboard
          </p>
        </div>
        {colorPaletteColors.map((category, i) => {
          return (
            <div key={i} style={{ marginBottom: '40px' }}>
              <p
                style={{
                  color: 'var(--twindcolors-slate-50)',
                  fontFamily: 'sans-serif',
                  margin: '10px 0',
                  paddingLeft: '5px'
                }}
              >
                {category.categoryName}
              </p>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isCompact ? 'row' : 'column',
                  gap: '4px',
                  flexWrap: 'wrap'
                }}
              >
                {category.colors.map((clr, j) => (
                  <CopyColorToClipboardComponent
                    key={j}
                    colorValue={clr.colorValue}
                    copyValue={clr.copyValue}
                    isCompact={isCompact}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CopyColorToClipboardComponent({ colorValue, copyValue, isCompact }) {
  const [gotCopied, setGotCopied] = React.useState(false);
  const handleCopy = () => {
    setGotCopied(true);
    setTimeout(() => {
      setGotCopied(false);
    }, 1500);
  };

  return (
    <CopyToClipboard onCopy={handleCopy} text={copyValue}>
      <CopyToClipboardButton
        text={copyValue}
        gotCopied={gotCopied}
        colorValue={colorValue}
        isCompact={isCompact}
      />
    </CopyToClipboard>
  );
}

function CopyToClipboardButton(props) {
  return (
    <div
      className="copy-color-to-clipboard-item"
      {...props}
      style={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        gap: '10px',
        padding: '6px',
        borderRadius: '5px',
        boxSizing: 'border-box',
        height: '45px'
      }}
    >
      <div
        className="click-to-copy-color-rectangle"
        style={{
          minWidth: '50px',
          height: '100%',

          background: props.colorValue,
          borderRadius: '5px',
          border: '1px solid white'
        }}
      ></div>
      {!props.isCompact && (
        <p
          style={{
            margin: '0',
            color: ' var(--twindcolors-slate-500)',
            fontFamily: 'sans-serif'
          }}
        >
          {props.text}
        </p>
      )}
      <IconSwitcher gotCopied={props.gotCopied} />
      <style>{`
				  .live-css-editor-plugin-wrapper {
					  & .copy-color-to-clipboard-item:hover {
						  background: var(--twindcolors-slate-800);
					  }
					  & .copy-color-to-clipboard-item:active {
						  background: var(--twindcolors-slate-700);
					  }
				  }
			  `}</style>
      {props.isCompact && (
        <style>{`
					  .live-css-editor-plugin-wrapper {
						  & .copy-color-to-clipboard-item{
							  position: relative;
							  justify-content: center;
							  width: 60px !important;
							  height: 60px !important;
							  border: none !important;
	  
							  & .copy-check-icon {
								  position: absolute;
								  background: white;
								  padding: 4px;
								  border-radius: 15px;
								  display: flex;
								  visibility: hidden;
								  align-items: center;
								  justify-content: center;
							  }
	  
							  & .copy-check-icon.gotCopied {
								  visibility: visible;
							  }
						  }
					  }
				  `}</style>
      )}
    </div>
  );
}
