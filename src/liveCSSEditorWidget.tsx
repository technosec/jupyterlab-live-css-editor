import { css } from '@codemirror/lang-css';
import { ReactWidget } from '@jupyterlab/apputils';
import CodeMirror from '@uiw/react-codemirror';
import React, {
  CSSProperties,
  MutableRefObject,
  useEffect,
  useRef,
  useState
} from 'react';
import { UnDrawSvg } from './svgs';
import { Clipboards } from './clickToCopy';

function LiveCSSEditor() {
  const [isCodeView, setIsCodeView] = useState(true);
  const [colorModule, setColorModule] = useState(null);
  const [applyCss, setApplyCss] = useState(false);
  const [value, setValue] = React.useState<string>(() => {
    return (
      JSON.parse(window.localStorage.getItem('liveCSSEditorPluginCSSValue') as string) ||
      ''
    );
  });

  const timeoutRef = useRef<MutableRefObject<NodeJS.Timeout>>(null);

  const onChange = React.useCallback((val, viewUpdate) => {
    debounce(
      () => {
        setValue(val);
        window.localStorage.setItem(
          'liveCSSEditorPluginCSSValue',
          JSON.stringify(val)
        );
      },
      undefined,
      timeoutRef as any
    )();
  }, []);

  useEffect(() => {
    const importColor = import('@uiw/codemirror-extensions-color');

    importColor
      .then(module => {
        setColorModule(module.color as any);
      })
      .catch(error => {
        console.error('Error during dynamic import:', error);
      });
  }, []);

  useEffect(() => {
    setIsCodeView(true);
  }, [applyCss]);

  return (
    <div className="live-css-editor-plugin">
      <div
        className="live-css-editor-controllers"
        style={{ justifyContent: applyCss ? 'space-between' : 'end' }}>
        {applyCss && (
          <div className="color-view-code-view-switcher">
            <button
              onClick={() => setIsCodeView(false)}
              className={`${!isCodeView ? 'css-editor-active-view' : ''} `}>
              colors
            </button>
            <button
              onClick={() => setIsCodeView(true)}
              className={`${isCodeView ? 'css-editor-active-view' : ''} `}>
              code
            </button>
          </div>
        )}
        <ToggleOnOFF doApplyCss={() => setApplyCss(prev => !prev)} />
      </div>
      <div className="live-css-cm-wrapper">
        {applyCss && colorModule ? (
          isCodeView ? (
            <CodeMirror
              value={value}
              className="code-mirror-class-name"
              /* cm-editor gets height, cm-theme-dark gets className, cm-scroller is responsible for overflow */
              autoFocus={true}
              extensions={[css(), colorModule]}
              onChange={onChange}
              basicSetup={{
                tabSize: 4
              }}
              theme={'dark'}
              placeholder={'Enter your css here'}
            />
          ) : (
            <Clipboards />
          )
        ) : (
          <div className="live-css-welcome-page">
            <UnDrawSvg />
            <h1>{`Hi :)`}</h1>
            <p>Click on Styles to activate the editor</p>
            <p>Your changes will be saved in your browser</p>
          </div>
        )}
      </div>
      {applyCss && <style>{`${value}`}</style>}
    </div>
  );
}

const debounce = (
  cb: Function,
  delay = 150,
  timeoutRef: MutableRefObject<NodeJS.Timeout>
) => {
  return (...args: any[]) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      cb(...args);
    }, delay);
  };
};

export class LiveCSSEditorWidget extends ReactWidget {
  constructor() {
    super();
  }
  render() {
    return <LiveCSSEditor />;
  }
}

/* --------------------------------------- toggle switch --------------------------------------- */

const ToggleOnOFF = ({ doApplyCss }) => {
  const [isStylesOn, setIsStylesOn] = useState(false);

  const switchStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '106px',
    height: '30px',
    borderRadius: '15px',
    padding: '2px',
    // background: isStylesOn ? '#333' : '#ccc',
    background: 'var(--twindcolors-slate-800)',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 1
  } as CSSProperties;

  const handleToggle = () => {
    setIsStylesOn(!isStylesOn);
    doApplyCss();
  };

  return (
    <div style={switchStyle} onClick={handleToggle}>
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          // background: isStylesOn ? '#000' : '#fff',
          background: 'var(--twindcolors-slate-500)',
          color: isStylesOn ? '#333' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          left: isStylesOn ? '76px' : '5px',
          transition: 'left 0.3s ease-in-out',
          zIndex: 100,
          userSelect: 'none'
        }}>
        {isStylesOn ? '🌞' : '🌜'}
      </div>
      <span
        style={{
          // color: isStylesOn ? '#fff' : '#333',
          color: 'var(--twindcolors-slate-200)',
          position: 'absolute',
          left: isStylesOn ? '8px' : '35px',
          transition: 'left 0.3s ease-in-out',
          userSelect: 'none'
        }}>
        {isStylesOn ? 'Styles On' : 'Styles Off'}
      </span>
      <style>{`
            * {
                font-family: Arial, Helvetica, sans-serif;
            }
            `}</style>
    </div>
  );
};
