import {
    ArrowDownTrayIcon,
    ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { ReactWidget } from '@jupyterlab/apputils';
import Editor, { useMonaco } from '@monaco-editor/react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import React, {
    MutableRefObject,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';
import { Clipboards } from './clickToCopy';
import { ToggleOnOFF, UnDrawSvg } from './svgs';

const styleSheets = {
    default: {
        appName: 'Default StyleSheet',
        storage: 'liveCSSEditorPluginCSSValue'
    },
    sheet2: {
        appName: 'StyleSheet 2',
        storage: 'liveCSSEditor-sheet-2'
    },
    sheet3: {
        appName: 'StyleSheet 3',
        storage: 'liveCSSEditor-sheet-3'
    },
    sheet4: {
        appName: 'StyleSheet 4',
        storage: 'liveCSSEditor-sheet-4'
    },
    sheet5: {
        appName: 'StyleSheet 5',
        storage: 'liveCSSEditor-sheet-5'
    }
};

type sheetKey = keyof typeof styleSheets;

type viewModeType = 'colors' | 'code' | 'sheets';

function toggleFromActives(
    sheetKey: sheetKey,
    activeSheets: sheetKey[]
): sheetKey[] {
    const index = activeSheets.indexOf(sheetKey);

    if (index === -1) {
        return [...activeSheets, sheetKey];
    } else {
        return [...activeSheets.filter((key, i) => i !== index)];
    }
}

function getActiveSheetsFromStorage(): sheetKey[] {
    const activeSheets = JSON.parse(
        window.localStorage.getItem('liveCSSEditorActiveSheets')
    ) as sheetKey[];

    if (activeSheets && activeSheets.length > 0) {
        return activeSheets;
    } else {
        return ['default'];
    }
}

function saveActiveSheetsToStorage(activeSheets: sheetKey[]) {
    window.localStorage.setItem(
        'liveCSSEditorActiveSheets',
        JSON.stringify(activeSheets)
    );
}

function getSheetStylesFromStorage(sheetKey: sheetKey): string {
    return (
        JSON.parse(
            window.localStorage.getItem(styleSheets[sheetKey].storage)
        ) || ''
    );
}

type cssValuesType = {
    [K in keyof typeof styleSheets]: string;
};

function getCurrentSheetFromStorage(): sheetKey {
    return (
        (JSON.parse(
            window.localStorage.getItem('liveCSSEditorCurrentSheet')
        ) as sheetKey) || 'default'
    );
}

function saveCurrentSheetToStorage(key: sheetKey) {
    window.localStorage.setItem(
        'liveCSSEditorCurrentSheet',
        JSON.stringify(key)
    );
}

// ****************************************************************************************

function LiveCSSEditor() {
    const [viewMode, setViewMode] = useState<viewModeType>('code');
    const [applyCss, setApplyCss] = useState(false);
    const timeoutRef = useRef<MutableRefObject<NodeJS.Timeout>>(null);
    const [currentSheet, setCurrentSheet] = useState<sheetKey>(() =>
        getCurrentSheetFromStorage()
    );
    const [activeSheets, setActiveSheets] = useState<sheetKey[]>(() =>
        getActiveSheetsFromStorage()
    );
    const [cssValues, setCssValues] = useState<cssValuesType>(() => {
        return {
            default: getSheetStylesFromStorage('default'),
            sheet2: getSheetStylesFromStorage('sheet2'),
            sheet3: getSheetStylesFromStorage('sheet3'),
            sheet4: getSheetStylesFromStorage('sheet4'),
            sheet5: getSheetStylesFromStorage('sheet5')
        };
    });

    useEffect(() => {
        setViewMode('code');
    }, [applyCss]);

    useEffect(() => {
        saveActiveSheetsToStorage(activeSheets);
    }, [activeSheets]);

    const editorDefaultValue = useMemo(() => {
        return cssValues[currentSheet];
    }, [currentSheet, applyCss, viewMode]);

    const handleEditorChange = React.useCallback(
        (val, event) => {
            debounce(
                () => {
                    setCssValues(prev => {
                        return {
                            ...prev,
                            [currentSheet]: val
                        };
                    });
                    window.localStorage.setItem(
                        styleSheets[currentSheet].storage,
                        JSON.stringify(val)
                    );
                },
                undefined,
                timeoutRef as any
            )();
        },
        [currentSheet]
    );

    function handleDownloadStyleSheets() {
        const zip = new JSZip();

        Object.keys(styleSheets).forEach((sheetKey: sheetKey) => {
            zip.file(
                styleSheets[sheetKey].appName + '.css',
                cssValues[sheetKey]
            );
        });

	
        zip.generateAsync({ type: 'blob' }).then(function (content) {
            saveAs(content, 'Your StyleSheets.zip');
        } as any);
    }

    return (
        <div className="live-css-editor-plugin">
            <div
                className="live-css-editor-controllers"
                style={{ justifyContent: applyCss ? 'space-between' : 'end' }}>
                {applyCss && (
                    <ColorViewCodeViewSwitch
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                    />
                )}
                <ToggleOnOFF doApplyCss={() => setApplyCss(prev => !prev)} />
            </div>
            <div className="live-css-cm-wrapper">
                {applyCss ? (
                    viewMode === 'code' ? (
                        <>
                            <CurrentSheetHeader
                                activeSheets={activeSheets}
                                setViewMode={setViewMode}
                                currentSheet={currentSheet}
                                setActiveSheets={setActiveSheets}
                            />
                            <div className="our-monaco-wrapper">
                                <LeMonaco
                                    editorDefaultValue={editorDefaultValue}
                                    handleEditorChange={handleEditorChange}
                                />
                            </div>
                        </>
                    ) : viewMode === 'colors' ? (
                        <Clipboards />
                    ) : (
                        <AllSheetsView
                            activeSheets={activeSheets}
                            setCurrentSheet={setCurrentSheet}
                            setViewMode={setViewMode}
                            setActiveSheets={setActiveSheets}
                            handleDownloadStyleSheets={
                                handleDownloadStyleSheets
                            }
                        />
                    )
                ) : (
                    <WelcomePage />
                )}
            </div>
            {applyCss &&
                // Applying styles in the order of style sheets.
                // The last style sheet will be applied last and there for will have the highest precedence.
                Object.keys(cssValues).map((key: sheetKey) => {
                    if (activeSheets.includes(key)) {
                        return <style key={key}>{`${cssValues[key]}`}</style>;
                    }
                })}
        </div>
    );
}

// ------------------------------------- Lé Monaco -------------------------------------

const LeMonaco = React.memo(
    ({ editorDefaultValue, handleEditorChange }: any) => {
        const monaco = useMonaco();

        useEffect(() => {
            monaco?.languages.css.cssDefaults.setOptions({ validate: false });
        }, [monaco]);

        function handleEditorDidMount(editor, monaco) {
            editor.focus();
            editor.updateOptions({
                lineNumbersMinChars: 1
            });
        }

        return (
            <Editor
                height="100%"
                defaultLanguage="css"
                defaultValue={editorDefaultValue}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                    scrollBeyondLastLine: false,
                    fontSize: 13,
                    tabSize: 4,
                    insertSpaces: false,
                    detectIndentation: false,
                    mouseWheelZoom: true,
                    minimap: {
                        enabled: false
                    },
                    padding: {
                        top: 20,
                        bottom: 150
                    }
                }}
                onMount={handleEditorDidMount}
            />
        );
    }
);

// ------------------------------------- All Sheets -------------------------------------

function AllSheetsView({
    activeSheets,
    setCurrentSheet,
    setViewMode,
    setActiveSheets,
    handleDownloadStyleSheets
}) {
    return (
        <div className="cssedit-sheets-page-wrapper">
            <div className="cssedit-sheets-header">
                <h1>All StyleSheets</h1>
                <div className="cssedit-active-styles-counter-div">
                    <p className="cssedit-header-active-counter">
                        {activeSheets.length}
                    </p>
                    <p>active styles</p>
                </div>
                <p>{`(The last sheet has the highest precedence)`}</p>
            </div>
            <div className="cssedit-sheets-wrapper">
                {Object.keys(styleSheets).map((key: sheetKey) => {
                    return (
                        <div
                            className={`cssedit-a-sheet ${
                                activeSheets.includes(key)
                                    ? 'cssedit-active-sheet'
                                    : ''
                            }`}
                            key={key}
                            onClick={() => {
                                setCurrentSheet(key);
                                saveCurrentSheetToStorage(key);
                                setViewMode('code');
                            }}>
                            <p>{styleSheets[key].appName}</p>
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    setActiveSheets(prev =>
                                        toggleFromActives(key, prev)
                                    );
                                }}>
                                {activeSheets.includes(key) ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    );
                })}
            </div>
            <div
                className="livecssedit-download-wrapper"
                onClick={handleDownloadStyleSheets}>
                <button>Download All Sheets As Zip</button>
                <ArrowDownTrayIcon className="livecssedit-download-icon" />
            </div>
        </div>
    );
}

// ------------------------------------- Current Sheet Header -------------------------------------

function CurrentSheetHeader({
    activeSheets,
    setViewMode,
    currentSheet,
    setActiveSheets
}) {
    return (
        <div className="cssedit-file-header">
            <div onClick={() => setViewMode('sheets')}>
                <ChevronLeftIcon
                    className="cssedit-go-back-icon"
                    style={{
                        height: '20px',
                        width: '20px'
                    }}
                />
                <p className="cssedit-header-active-counter">
                    {activeSheets.length}
                </p>
                <p
                    className={`cssedit-current-file-name ${
                        activeSheets.includes(currentSheet)
                            ? 'cssedit-current-file-active'
                            : ''
                    }`}>
                    {styleSheets[currentSheet].appName}
                </p>
            </div>
            <button
                onClick={() =>
                    setActiveSheets(prev =>
                        toggleFromActives(currentSheet, activeSheets)
                    )
                }
                className={`cssedit-toggle-individual-file ${
                    activeSheets.includes(currentSheet)
                        ? 'cssedit-current-sheet-is-active'
                        : ''
                }`}>
                {activeSheets.includes(currentSheet) ? 'ON' : 'OFF'}
            </button>
        </div>
    );
}

// ------------------------------------- Others -------------------------------------

function ColorViewCodeViewSwitch({
    viewMode,
    setViewMode
}: {
    viewMode: viewModeType;
    setViewMode;
}) {
    return (
        <div className="color-view-code-view-switcher">
            <button
                onClick={() => setViewMode('colors')}
                className={`${
                    viewMode === 'colors' ? 'css-editor-active-view' : ''
                } `}>
                colors
            </button>
            <button
                onClick={() => setViewMode('code')}
                className={`${
                    viewMode === 'code' ? 'css-editor-active-view' : ''
                } `}>
                code
            </button>
        </div>
    );
}

function WelcomePage() {
    return (
        <div className="live-css-welcome-page">
            <UnDrawSvg />
            <h1>{`Hi :)`}</h1>
            <p>Click on Styles to activate the editor</p>
            <p>Your changes will be saved in your browser</p>
        </div>
    );
}

const debounce = (
    cb: Function,
    delay = 200,
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
