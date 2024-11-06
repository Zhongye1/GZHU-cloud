import {
  TFile,
  Plugin,
  WorkspaceLeaf,
  addIcon,
  App,
  PluginManifest,
  MarkdownView,
  normalizePath,
  Menu,
  MenuItem,
  TAbstractFile,
  ViewState,
  Notice,
  request,
  MetadataCache,
  FrontMatterCache,
  Command,
  Workspace,
  Editor,
  MarkdownFileInfo,
  loadMermaid,
} from "obsidian";
import {
  BLANK_DRAWING,
  VIEW_TYPE_EXCALIDRAW,
  EXCALIDRAW_ICON,
  ICON_NAME,
  SCRIPTENGINE_ICON,
  SCRIPTENGINE_ICON_NAME,
  RERENDER_EVENT,
  FRONTMATTER_KEYS,
  FRONTMATTER,
  JSON_parse,
  nanoid,
  DARK_BLANK_DRAWING,
  SCRIPT_INSTALL_CODEBLOCK,
  SCRIPT_INSTALL_FOLDER,
  EXPORT_TYPES,
  EXPORT_IMG_ICON_NAME,
  EXPORT_IMG_ICON,
  LOCALE,
  IMAGE_TYPES,
  setExcalidrawPlugin,
  DEVICE,
  sceneCoordsToViewportCoords,
  FONTS_STYLE_ID,
} from "./constants/constants";
import ExcalidrawView, { TextMode, getTextMode } from "./ExcalidrawView";
import {
  changeThemeOfExcalidrawMD,
  getMarkdownDrawingSection,
  ExcalidrawData,
  REGEX_LINK,
} from "./ExcalidrawData";
import {
  ExcalidrawSettings,
  DEFAULT_SETTINGS,
  ExcalidrawSettingTab,
} from "./settings";
import { openDialogAction, OpenFileDialog } from "./dialogs/OpenDrawing";
import { InsertLinkDialog } from "./dialogs/InsertLinkDialog";
import { InsertCommandDialog } from "./dialogs/InsertCommandDialog";
import { InsertImageDialog } from "./dialogs/InsertImageDialog";
import { ImportSVGDialog } from "./dialogs/ImportSVGDialog";
import { InsertMDDialog } from "./dialogs/InsertMDDialog";
import {
  initExcalidrawAutomate,
  ExcalidrawAutomate,
  insertLaTeXToView,
  search,
} from "./ExcalidrawAutomate";
import { Prompt, templatePromt } from "./dialogs/Prompt";
import { around, dedupe } from "monkey-around";
import { t } from "./lang/helpers";
import {
  checkAndCreateFolder,
  download,
  fileShouldDefaultAsExcalidraw,
  getAliasWithSize,
  getAnnotationFileNameAndFolder,
  getCropFileNameAndFolder,
  getDrawingFilename,
  getEmbedFilename,
  getIMGFilename,
  getLink,
  getListOfTemplateFiles,
  getNewUniqueFilepath,
  getURLImageExtension,
} from "./utils/FileUtils";
import {
  getFontDataURL,
  errorlog,
  setLeftHandedMode,
  sleep,
  isVersionNewerThanOther,
  getExportTheme,
  isCallerFromTemplaterPlugin,
  decompress,
  getImageSize,
  versionUpdateCheckTimer,
  getFontMetrics,
} from "./utils/Utils";
import { editorInsertText, extractSVGPNGFileName, foldExcalidrawSection, getActivePDFPageNumberFromPDFView, getAttachmentsFolderAndFilePath, getExcalidrawViews, getNewOrAdjacentLeaf, getParentOfClass, isObsidianThemeDark, mergeMarkdownFiles, openLeaf, setExcalidrawView } from "./utils/ObsidianUtils";
import { ExcalidrawElement, ExcalidrawEmbeddableElement, ExcalidrawImageElement, ExcalidrawTextElement, FileId } from "@zsviczian/excalidraw/types/excalidraw/element/types";
import { ScriptEngine } from "./Scripts";
import {
  hoverEvent,
  initializeMarkdownPostProcessor,
  markdownPostProcessor,
  legacyExcalidrawPopoverObserver,
} from "./MarkdownPostProcessor";

import { FieldSuggester } from "./dialogs/FieldSuggester";
import { ReleaseNotes } from "./dialogs/ReleaseNotes";
import { Packages } from "./types/types";
import { PreviewImageType } from "./utils/UtilTypes";
import { ScriptInstallPrompt } from "./dialogs/ScriptInstallPrompt";
import Taskbone from "./ocr/Taskbone";
import { emulateCTRLClickForLinks, linkClickModifierType, PaneTarget } from "./utils/ModifierkeyHelper";
import { InsertPDFModal } from "./dialogs/InsertPDFModal";
import { ExportDialog } from "./dialogs/ExportDialog";
import { UniversalInsertFileModal } from "./dialogs/UniversalInsertFileModal";
import { imageCache } from "./utils/ImageCache";
import { StylesManager } from "./utils/StylesManager";
import { PublishOutOfDateFilesDialog } from "./dialogs/PublishOutOfDateFiles";
import { EmbeddableSettings } from "./dialogs/EmbeddableSettings";
import { processLinkText } from "./utils/CustomEmbeddableUtils";
import { getEA } from "src";
import { ExcalidrawImperativeAPI } from "@zsviczian/excalidraw/types/excalidraw/types";
import { Mutable } from "@zsviczian/excalidraw/types/excalidraw/utility-types";
import { CustomMutationObserver, debug, log, DEBUGGING, setDebugging } from "./utils/DebugHelper";
import { carveOutImage, carveOutPDF, createImageCropperFile } from "./utils/CarveOut";
import { ExcalidrawConfig } from "./utils/ExcalidrawConfig";
import { EditorHandler } from "./CodeMirrorExtension/EditorHandler";
import { clearMathJaxVariables } from "./LaTeX";
import { showFrameSettings } from "./dialogs/FrameSettings";
import { ExcalidrawLib } from "./ExcalidrawLib";
import { Rank, SwordColors } from "./menu/ActionIcons";
import { RankMessage } from "./dialogs/RankMessage";
import { initCompressionWorker, terminateCompressionWorker } from "./workers/compression-worker";
import { WeakArray } from "./utils/WeakArray";

declare let EXCALIDRAW_PACKAGES:string;
declare let react:any;
declare let reactDOM:any;
declare let excalidrawLib: typeof ExcalidrawLib;
declare let PLUGIN_VERSION:string;

export default class ExcalidrawPlugin extends Plugin {
  public eaInstances = new WeakArray<ExcalidrawAutomate>();
  public fourthFontLoaded: boolean = false;
  public excalidrawConfig: ExcalidrawConfig;
  public taskbone: Taskbone;
  private excalidrawFiles: Set<TFile> = new Set<TFile>();
  public excalidrawFileModes: { [file: string]: string } = {};
  private _loaded: boolean = false;
  public settings: ExcalidrawSettings;
  private openDialog: OpenFileDialog;
  public insertLinkDialog: InsertLinkDialog;
  public insertCommandDialog: InsertCommandDialog;
  public insertImageDialog: InsertImageDialog;
  public importSVGDialog: ImportSVGDialog;
  public insertMDDialog: InsertMDDialog;
  public activeExcalidrawView: ExcalidrawView = null;
  public lastActiveExcalidrawFilePath: string = null;
  public hover: { linkText: string; sourcePath: string } = {
    linkText: null,
    sourcePath: null,
  };
  private legacyExcalidrawPopoverObserver: MutationObserver | CustomMutationObserver;
  private themeObserver: MutationObserver | CustomMutationObserver;
  private fileExplorerObserver: MutationObserver | CustomMutationObserver;
  private modalContainerObserver: MutationObserver | CustomMutationObserver;
  private workspaceDrawerLeftObserver: MutationObserver | CustomMutationObserver;
  private workspaceDrawerRightObserver: MutationObserver  | CustomMutationObserver;
  public opencount: number = 0;
  public ea: ExcalidrawAutomate;
  //A master list of fileIds to facilitate copy / paste
  public filesMaster: Map<FileId, { isHyperLink: boolean; isLocalLink: boolean; path: string; hasSVGwithBitmap: boolean; blockrefData: string, colorMapJSON?: string}> =
    null; //fileId, path
  public equationsMaster: Map<FileId, string> = null; //fileId, formula
  public mermaidsMaster: Map<FileId, string> = null; //fileId, mermaidText
  public scriptEngine: ScriptEngine;
  private packageMap: Map<Window,Packages> = new Map<Window,Packages>();
  public leafChangeTimeout: number = null;
  private forceSaveCommand:Command;
  private removeEventLisnters:(()=>void)[] = [];
  private stylesManager:StylesManager;
  public editorHandler: EditorHandler;
  //if set, the next time this file is opened it will be opened as markdown
  public forceToOpenInMarkdownFilepath: string = null;
  //private slob:string;
  private ribbonIcon:HTMLElement;
  public loadTimestamp:number;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    this.packageMap.set(window,{react, reactDOM, excalidrawLib});
    this.filesMaster = new Map<
      FileId,
      { isHyperLink: boolean; isLocalLink: boolean; path: string; hasSVGwithBitmap: boolean; blockrefData: string; colorMapJSON?: string }
    >();
    this.equationsMaster = new Map<FileId, string>();
    this.mermaidsMaster = new Map<FileId, string>();
    setExcalidrawPlugin(this);
    /*if((process.env.NODE_ENV === 'development')) {
      this.slob = new Array(200 * 1024 * 1024 + 1).join('A'); // Create a 200MB blob
    }*/
  }

  get locale() {
    return LOCALE;
  }

  get window(): Window {
    return window;
  };

  get document(): Document {
    return document;
  };

  public deletePackage(win:Window) {
    //window.console.log("ExcalidrawPlugin.deletePackage",win, this.packageMap.has(win));
    const {react, reactDOM, excalidrawLib} = this.getPackage(win);
    
    //@ts-ignore
    if(win.ExcalidrawLib === excalidrawLib) {
    excalidrawLib.destroyObsidianUtils();
    //@ts-ignore
    delete win.ExcalidrawLib;
    }

    //@ts-ignore
    if(win.React === react) {
      //@ts-ignore
      Object.keys(win.React).forEach((key) => {
        //@ts-ignore
        delete win.React[key];
      });
      //@ts-ignore
      delete win.React;
    }
    //@ts-ignore
    if(win.ReactDOM === reactDOM) {
      //@ts-ignore
      Object.keys(win.ReactDOM).forEach((key) => {
        //@ts-ignore    
        delete win.ReactDOM[key];
      });
      //@ts-ignore
      delete win.ReactDOM;
    }
    if(this.packageMap.has(win)) {
      this.packageMap.delete(win);
    }
  }

  public getPackage(win:Window):Packages {
    (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.getPackage, `ExcalidrawPlugin.getPackage`, win);

    if(this.packageMap.has(win)) {
      return this.packageMap.get(win);
    }
    
    //@ts-ignore
    const {react:r, reactDOM:rd, excalidrawLib:e} = win.eval.call(win,
      `(function() {
        ${EXCALIDRAW_PACKAGES};
        return {react:React,reactDOM:ReactDOM,excalidrawLib:ExcalidrawLib};
       })()`);
    this.packageMap.set(win,{react:r, reactDOM:rd, excalidrawLib:e});
    return {react:r, reactDOM:rd, excalidrawLib:e};
    
  }

  // by adding the wrapper like this, likely in debug mode I am leaking memory because my code removes
  // the original event handlers, not the wrapped ones. I will only uncomment this if I need to debug
  /*public registerEvent(event: any) {
    if (process.env.NODE_ENV !== 'development') {
      super.registerEvent(event);
      return;
    } else {
      if(!DEBUGGING) {
        super.registerEvent(event);
        return;
      }
      const originalHandler = event.fn;

      // Wrap the original event handler
      const wrappedHandler = async (...args: any[]) => {
        const startTime = performance.now(); // Get start time
    
        // Invoke the original event handler
        const result = await originalHandler(...args);
    
        const endTime = performance.now(); // Get end time
        const executionTime = endTime - startTime;
    
        if(executionTime > durationTreshold) {
          console.log(`Excalidraw Event '${event.name}' took ${executionTime}ms to execute`);
        }
    
        return result;
      }
  
      // Replace the original event handler with the wrapped one
      event.fn = wrappedHandler;
    
      // Register the modified event
      super.registerEvent(event);
    };
  }*/
  
  async onload() {
    initCompressionWorker();
    this.loadTimestamp = Date.now();
    addIcon(ICON_NAME, EXCALIDRAW_ICON);
    addIcon(SCRIPTENGINE_ICON_NAME, SCRIPTENGINE_ICON);
    addIcon(EXPORT_IMG_ICON_NAME, EXPORT_IMG_ICON);

    await this.loadSettings({reEnableAutosave:true});
    const updateSettings = !this.settings.onceOffCompressFlagReset || !this.settings.onceOffGPTVersionReset;
    if(!this.settings.onceOffCompressFlagReset) {
      this.settings.compress = true;
      this.settings.onceOffCompressFlagReset = true;
    }
    if(!this.settings.onceOffGPTVersionReset) {
      if(this.settings.openAIDefaultVisionModel === "gpt-4-vision-preview") {
        this.settings.openAIDefaultVisionModel = "gpt-4o";
      }
    }
    if(updateSettings) {
      await this.saveSettings();
    }
    this.excalidrawConfig = new ExcalidrawConfig(this);
    await loadMermaid();
    this.editorHandler = new EditorHandler(this);
    this.editorHandler.setup();
    
    this.addSettingTab(new ExcalidrawSettingTab(this.app, this));
    this.ea = await initExcalidrawAutomate(this);

    this.registerView(
      VIEW_TYPE_EXCALIDRAW,
      (leaf: WorkspaceLeaf) => new ExcalidrawView(leaf, this),
    );

    //Compatibility mode with .excalidraw files
    this.registerExtensions(["excalidraw"], VIEW_TYPE_EXCALIDRAW);

    this.addMarkdownPostProcessor();
    this.registerInstallCodeblockProcessor();
    this.addThemeObserver();
    this.experimentalFileTypeDisplayToggle(this.settings.experimentalFileType);
    this.registerCommands();
    this.registerEventListeners();
    this.runStartupScript();
    this.initializeFonts();
    this.registerEditorSuggest(new FieldSuggester(this));
    this.setPropertyTypes();

    //inspiration taken from kanban:
    //https://github.com/mgmeyers/obsidian-kanban/blob/44118e25661bff9ebfe54f71ae33805dc88ffa53/src/main.ts#L267
    this.registerMonkeyPatches();

    this.stylesManager = new StylesManager(this);

    //    const patches = new OneOffs(this);
    if (this.settings.showReleaseNotes) {
      //I am repurposing imageElementNotice, if the value is true, this means the plugin was just newly installed to Obsidian.
      const obsidianJustInstalled = this.settings.previousRelease === "0.0.0"

      if (isVersionNewerThanOther(PLUGIN_VERSION, this.settings.previousRelease)) {
        new ReleaseNotes(
          this.app,
          this,
          obsidianJustInstalled ? null : PLUGIN_VERSION,
        ).open();
      }
    }

    this.switchToExcalidarwAfterLoad();

    this.app.workspace.onLayoutReady(() => {
      (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.onload,"ExcalidrawPlugin.onload > app.workspace.onLayoutReady");
      this.scriptEngine = new ScriptEngine(this);
      imageCache.initializeDB(this);
    });
    this.taskbone = new Taskbone(this);
  }

  private setPropertyTypes() {
    if(!this.settings.loadPropertySuggestions) return;
    const app = this.app;
    this.app.workspace.onLayoutReady(() => {
      (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.setPropertyTypes, `ExcalidrawPlugin.setPropertyTypes > app.workspace.onLayoutReady`);
      Object.keys(FRONTMATTER_KEYS).forEach((key) => {
        if(FRONTMATTER_KEYS[key].depricated === true) return;
        const {name, type} = FRONTMATTER_KEYS[key];
        app.metadataTypeManager.setType(name,type);
      });
    });
  }

  public initializeFonts() {
    this.app.workspace.onLayoutReady(async () => {
      (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.initializeFonts, `ExcalidrawPlugin.initializeFonts > app.workspace.onLayoutReady`);
  
      const font = await getFontDataURL(
        this.app,
        this.settings.experimantalFourthFont,
        "",
        "Local Font",
      );
      
      if(font.dataURL === "") {
        this.fourthFontLoaded = true;
        return;
      }
      
      const fourthFontDataURL = font.dataURL;
  
      const f = this.app.metadataCache.getFirstLinkpathDest(this.settings.experimantalFourthFont, "");
      // Call getFontMetrics with the fourthFontDataURL
      let fontMetrics = f.extension.startsWith("woff") ? undefined : await getFontMetrics(fourthFontDataURL, "Local Font");
      
      if (!fontMetrics) {
        console.log("Font Metrics not found, using default");
        fontMetrics = {
          unitsPerEm: 1000,
          ascender: 750,
          descender: -250,
          lineHeight: 1.2,
          fontName: "Local Font",
        }
      }
      this.packageMap.forEach(({excalidrawLib}) => {
        (excalidrawLib as typeof ExcalidrawLib).registerLocalFont({metrics: fontMetrics as any, icon: null}, fourthFontDataURL);
      });
      // Add fonts to open Obsidian documents
      for(const ownerDocument of this.getOpenObsidianDocuments()) {
        await this.addFonts([
          `@font-face{font-family:'Local Font';src:url("${fourthFontDataURL}");font-display: swap;font-weight: 400;`,
        ], ownerDocument);
      };
      if(!this.fourthFontLoaded) setTimeout(()=>{this.fourthFontLoaded = true},100);
    });
  }

  public async addFonts(declarations: string[],ownerDocument:Document = document) {
    // replace the old local font <style> element with the one we just created
    const newStylesheet = ownerDocument.createElement("style");
    newStylesheet.id = FONTS_STYLE_ID;
    newStylesheet.textContent = declarations.join("");
    const oldStylesheet = ownerDocument.getElementById(FONTS_STYLE_ID);
    ownerDocument.head.appendChild(newStylesheet);
    if (oldStylesheet) {
      ownerDocument.head.removeChild(oldStylesheet);
    }
    await ownerDocument.fonts.load('20px Local Font');
  }

  public removeFonts() {
    this.getOpenObsidianDocuments().forEach((ownerDocument) => {
      const oldStylesheet = ownerDocument.getElementById(FONTS_STYLE_ID);
      if (oldStylesheet) {
        ownerDocument.head.removeChild(oldStylesheet);
      }
    })
  }
  
  private getOpenObsidianDocuments(): Document[] {
    (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.getOpenObsidianDocuments,`ExcalidrawPlugin.getOpenObsidianDocuments`);
    const visitedDocs = new Set<Document>();
    this.app.workspace.iterateAllLeaves((leaf)=>{
      const ownerDocument = DEVICE.isMobile?document:leaf.view.containerEl.ownerDocument;   
      if(!ownerDocument) return;        
      if(visitedDocs.has(ownerDocument)) return;
      visitedDocs.add(ownerDocument);
    });
    return Array.from(visitedDocs);
  }

  private switchToExcalidarwAfterLoad() {
    this.app.workspace.onLayoutReady(() => {
      (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.switchToExcalidarwAfterLoad, `ExcalidrawPlugin.switchToExcalidarwAfterLoad > app.workspace.onLayoutReady`);
      let leaf: WorkspaceLeaf;
      for (leaf of this.app.workspace.getLeavesOfType("markdown")) {
        if ( leaf.view instanceof MarkdownView && this.isExcalidrawFile(leaf.view.file)) {
          if (fileShouldDefaultAsExcalidraw(leaf.view.file?.path, this.app)) {
            this.excalidrawFileModes[(leaf as any).id || leaf.view.file.path] =
              VIEW_TYPE_EXCALIDRAW;
            setExcalidrawView(leaf);
          } else {
            foldExcalidrawSection(leaf.view);
          }
        }
      }
    });
  }

  private forceSaveActiveView(checking:boolean):boolean {
    if (checking) {
      return Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView));
    }
    const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
    if (view) {
      view.forceSave();
      return true;
    }
    return false;
  }

  private registerInstallCodeblockProcessor() {
    const codeblockProcessor = async (source: string, el: HTMLElement) => {
      //Button next to the "List of available scripts" at the top
      //In try/catch block because this approach is very error prone, depends on
      //MarkdownRenderer() and index.md structure, in case these are not as
      //expected this code will break
      let button2: HTMLButtonElement = null;
      try {
        const link: HTMLElement = el.parentElement.querySelector(
          `a[href="#${el.previousElementSibling.getAttribute(
            "data-heading",
          )}"]`,
        );
        link.style.paddingRight = "10px";
        button2 = link.parentElement.createEl("button", null, (b) => {
          b.setText(t("UPDATE_SCRIPT"));
          b.addClass("mod-muted");
          b.style.backgroundColor = "var(--interactive-success)";
          b.style.display = "none";
        });
      } catch (e) {
        errorlog({
          where: "this.registerInstallCodeblockProcessor",
          source,
          error: e,
        });
      }

      source = source.trim();
      el.createEl("button", null, async (button) => {
        const setButtonText = (
          text: "CHECKING" | "INSTALL" | "UPTODATE" | "UPDATE" | "ERROR",
        ) => {
          if (button2) {
            button2.style.display = "none";
          }
          switch (text) {
            case "CHECKING":
              button.setText(t("CHECKING_SCRIPT"));
              button.style.backgroundColor = "var(--interactive-normal)";
              break;
            case "INSTALL":
              button.setText(t("INSTALL_SCRIPT"));
              button.style.backgroundColor = "var(--interactive-accent)";
              break;
            case "UPTODATE":
              button.setText(t("UPTODATE_SCRIPT"));
              button.style.backgroundColor = "var(--interactive-normal)";
              break;
            case "UPDATE":
              button.setText(t("UPDATE_SCRIPT"));
              button.style.backgroundColor = "var(--interactive-success)";
              if (button2) {
                button2.style.display = null;
              }
              break;
            case "ERROR":
              button.setText(t("UNABLETOCHECK_SCRIPT"));
              button.style.backgroundColor = "var(--interactive-normal)";
              break;
          }
        };
        button.addClass("mod-muted");
        let decodedURI = source;
        try {
          decodedURI = decodeURI(source);
        } catch (e) {
          errorlog({
            where:
              "ExcalidrawPlugin.registerInstallCodeblockProcessor.codeblockProcessor.onClick",
            source,
            error: e,
          });
        }
        const fname = decodedURI.substring(decodedURI.lastIndexOf("/") + 1);
        const folder = `${this.settings.scriptFolderPath}/${SCRIPT_INSTALL_FOLDER}`;
        const downloaded = app.vault.getFiles().filter(f=>f.path.startsWith(folder) && f.name === fname).sort((a,b)=>a.path>b.path?1:-1);
        let scriptFile = downloaded[0]; 
        const scriptPath = scriptFile?.path ?? `${folder}/${fname}`;
        const svgPath = getIMGFilename(scriptPath, "svg");
        let svgFile = this.app.vault.getAbstractFileByPath(svgPath);
        setButtonText(scriptFile ? "CHECKING" : "INSTALL");
        button.onclick = async () => {
          const download = async (
            url: string,
            file: TFile,
            localPath: string,
          ): Promise<TFile> => {
            const data = await request({ url });
            if (!data || data.startsWith("404: Not Found")) {
              return null;
            }
            if (file) {
              await this.app.vault.modify(file as TFile, data);
            } else {
              await checkAndCreateFolder(folder);
              file = await this.app.vault.create(localPath, data);
            }
            return file;
          };

          try {
            scriptFile = await download(
              source,
              scriptFile as TFile,
              scriptPath,
            );
            if (!scriptFile) {
              setButtonText("ERROR");
              throw "File not found";
            }
            svgFile = await download(
              getIMGFilename(source, "svg"),
              svgFile as TFile,
              svgPath,
            );
            setButtonText("UPTODATE");
            if(Object.keys(this.scriptEngine.scriptIconMap).length === 0) {
              this.scriptEngine.loadScripts();
            }
            new Notice(`Installed: ${(scriptFile as TFile).basename}`);
          } catch (e) {
            new Notice(`Error installing script: ${fname}`);
            errorlog({
              where:
                "ExcalidrawPlugin.registerInstallCodeblockProcessor.codeblockProcessor.onClick",
              error: e,
            });
          }
        };
        if (button2) {
          button2.onclick = button.onclick;
        }

        //check modified date on github
        //https://superuser.com/questions/1406875/how-to-get-the-latest-commit-date-of-a-file-from-a-given-github-reposotiry
        if (!scriptFile || !(scriptFile instanceof TFile)) {
          return;
        }

        const files = new Map<string, number>();
        JSON.parse(
          await request({
            url: "https://raw.githubusercontent.com/zsviczian/obsidian-excalidraw-plugin/master/ea-scripts/directory-info.json",
          }),
        ).forEach((f: any) => files.set(f.fname, f.mtime));

        const checkModifyDate = (
          gitFilename: string,
          file: TFile,
        ): "ERROR" | "UPDATE" | "UPTODATE" => {
          if (files.size === 0 || !files.has(gitFilename)) {
            //setButtonText("ERROR");
            return "ERROR";
          }
          const mtime = files.get(gitFilename);
          if (!file || mtime > file.stat.mtime) {
            //setButtonText("UPDATE");
            return "UPDATE";
          }
          return "UPTODATE";
        };

        const scriptButtonText = checkModifyDate(fname, scriptFile);
        const svgButtonText = checkModifyDate(
          getIMGFilename(fname, "svg"),
          !svgFile || !(svgFile instanceof TFile) ? null : svgFile,
        );

        setButtonText(
          scriptButtonText === "UPTODATE" && svgButtonText === "UPTODATE"
            ? "UPTODATE"
            : scriptButtonText === "UPTODATE" && svgButtonText === "ERROR"
            ? "UPTODATE"
            : scriptButtonText === "ERROR"
            ? "ERROR"
            : scriptButtonText === "UPDATE" || svgButtonText === "UPDATE"
            ? "UPDATE"
            : "UPTODATE",
        );
      });
    };

    this.registerMarkdownCodeBlockProcessor(
      SCRIPT_INSTALL_CODEBLOCK,
      async (source, el) => {
        el.addEventListener(RERENDER_EVENT, async (e) => {
          e.stopPropagation();
          el.empty();
          codeblockProcessor(source, el);
        });
        codeblockProcessor(source, el);
      },
    );
  }

  /**
   * Displays a transcluded .excalidraw image in markdown preview mode
   */
  private addMarkdownPostProcessor() {
    //Licat: Are you registering your post processors in onLayoutReady? You should register them in onload instead
    initializeMarkdownPostProcessor(this);
    this.registerMarkdownPostProcessor(markdownPostProcessor);
    
    this.app.workspace.onLayoutReady(() => {
      (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.addMarkdownPostProcessor, `ExcalidrawPlugin.addMarkdownPostProcessor > app.workspace.onLayoutReady`);

      // internal-link quick preview
      this.registerEvent(this.app.workspace.on("hover-link", hoverEvent));

      //only add the legacy file observer if there are legacy files in the vault
      if(this.app.vault.getFiles().some(f=>f.extension === "excalidraw")) {
        this.enableLegacyFilePopoverObserver();
      }
    });
  }

  public enableLegacyFilePopoverObserver() {
    if(!this.legacyExcalidrawPopoverObserver) {
      (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.enableLegacyFilePopoverObserver, `ExcalidrawPlugin.enableLegacyFilePopoverObserver > enabling`)
      //monitoring for div.popover.hover-popover.file-embed.is-loaded to be added to the DOM tree
      this.legacyExcalidrawPopoverObserver = legacyExcalidrawPopoverObserver;
      this.legacyExcalidrawPopoverObserver.observe(document.body, { childList: true, subtree: false });
    }
  }

  public addThemeObserver() {
    if(this.themeObserver) return;
    const { matchThemeTrigger } = this.settings;
    if (!matchThemeTrigger) return;

    const themeObserverFn:MutationCallback = async (mutations: MutationRecord[]) => {
      (process.env.NODE_ENV === 'development') && DEBUGGING && debug(themeObserverFn, `ExcalidrawPlugin.addThemeObserver`, mutations);
      const { matchThemeTrigger } = this.settings;
      if (!matchThemeTrigger) return;

      const bodyClassList = document.body.classList;
      const mutation = mutations[0];
      if (mutation?.oldValue === bodyClassList.value) return;
      
      const darkClass = bodyClassList.contains('theme-dark');
      if (mutation?.oldValue?.includes('theme-dark') === darkClass) return;

      setTimeout(()=>{ //run async to avoid blocking the UI
        const theme = isObsidianThemeDark() ? "dark" : "light";
        const excalidrawViews = getExcalidrawViews(this.app);
        excalidrawViews.forEach(excalidrawView => {
          if (excalidrawView.file && excalidrawView.excalidrawAPI) {
            excalidrawView.setTheme(theme);
          }
        });
      });
    };

    this.themeObserver = DEBUGGING
      ? new CustomMutationObserver(themeObserverFn, "themeObserver")
      : new MutationObserver(themeObserverFn);
  
    this.themeObserver.observe(document.body, {
      attributeOldValue: true,
      attributeFilter: ["class"],
    });
  }

  public removeThemeObserver() {
    if(!this.themeObserver) return;
    this.themeObserver.disconnect();
    this.themeObserver = null;
  }

  public experimentalFileTypeDisplayToggle(enabled: boolean) {
    if (enabled) {
      this.experimentalFileTypeDisplay();
      return;
    }
    if (this.fileExplorerObserver) {
      this.fileExplorerObserver.disconnect();
    }
    this.fileExplorerObserver = null;
  }

  /**
   * Display characters configured in settings, in front of the filename, if the markdown file is an excalidraw drawing
   */
  private experimentalFileTypeDisplay() {
    (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.experimentalFileTypeDisplay, `ExcalidrawPlugin.experimentalFileTypeDisplay`);
    const insertFiletype = (el: HTMLElement) => {
      if (el.childElementCount !== 1) {
        return;
      }
      const filename = el.getAttribute("data-path");
      if (!filename) {
        return;
      }
      const f = this.app.vault.getAbstractFileByPath(filename);
      if (!f || !(f instanceof TFile)) {
        return;
      }
      if (this.isExcalidrawFile(f)) {
        el.insertBefore(
          createDiv({
            cls: "nav-file-tag",
            text: this.settings.experimentalFileTag,
          }),
          el.firstChild,
        );
      }
    };

    const fileExplorerObserverFn:MutationCallback = (mutationsList) => {
      (process.env.NODE_ENV === 'development') && DEBUGGING && debug(fileExplorerObserverFn, `ExcalidrawPlugin.experimentalFileTypeDisplay > fileExplorerObserverFn`, mutationsList);
      const mutationsWithNodes = mutationsList.filter((mutation) => mutation.addedNodes.length > 0);
      mutationsWithNodes.forEach((mutationNode) => {
        mutationNode.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) {
            return;
          }
          node.querySelectorAll(".nav-file-title").forEach(insertFiletype);
        });
      });
    };

    this.fileExplorerObserver = DEBUGGING
      ? new CustomMutationObserver(fileExplorerObserverFn, "fileExplorerObserver")
      : new MutationObserver(fileExplorerObserverFn);

    this.app.workspace.onLayoutReady(() => {
      (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.experimentalFileTypeDisplay, `ExcalidrawPlugin.experimentalFileTypeDisplay > app.workspace.onLayoutReady`);
      document.querySelectorAll(".nav-file-title").forEach(insertFiletype); //apply filetype to files already displayed
      const container = document.querySelector(".nav-files-container");
      if (container) {
        this.fileExplorerObserver.observe(container, {
          childList: true,
          subtree: true,
        });
      }
    });
  }

  private async actionRibbonClick(e: MouseEvent)  {
    this.createAndOpenDrawing(
      getDrawingFilename(this.settings),
      linkClickModifierType(emulateCTRLClickForLinks(e)),
    ); 
  }

  private registerCommands() {
    this.openDialog = new OpenFileDialog(this.app, this);
    this.insertLinkDialog = new InsertLinkDialog(this);
    this.insertCommandDialog = new InsertCommandDialog(this.app);
    this.insertImageDialog = new InsertImageDialog(this);
    this.importSVGDialog = new ImportSVGDialog(this);
    this.insertMDDialog = new InsertMDDialog(this);

    this.ribbonIcon = this.addRibbonIcon(ICON_NAME, t("CREATE_NEW"), this.actionRibbonClick.bind(this));

    const createNewAction = (e: MouseEvent | KeyboardEvent, file: TFile) => {
      let folderpath = file.path;
      if (file instanceof TFile) {
        folderpath = normalizePath(
          file.path.substr(0, file.path.lastIndexOf(file.name)),
        );
      }
      this.createAndOpenDrawing(
        getDrawingFilename(this.settings),
        linkClickModifierType(emulateCTRLClickForLinks(e)),
        folderpath,
      );
    }

    const fileMenuHandlerCreateNew = (menu: Menu, file: TFile) => {
      menu.addItem((item: MenuItem) => {
        item
          .setTitle(t("CREATE_NEW"))
          .setIcon(ICON_NAME)
          .onClick((e) => {createNewAction(e, file)});
      });
    };

    this.registerEvent(
      this.app.workspace.on("file-menu", fileMenuHandlerCreateNew),
    );

    const fileMenuHandlerConvertKeepExtension = (menu: Menu, file: TFile) => {
      if (file instanceof TFile && file.extension == "excalidraw") {
        menu.addItem((item: MenuItem) => {
          item.setTitle(t("CONVERT_FILE_KEEP_EXT")).onClick(() => {
            this.convertSingleExcalidrawToMD(file, false, false);
          });
        });
      }
    };

    this.registerEvent(
      this.app.workspace.on("file-menu", fileMenuHandlerConvertKeepExtension),
    );

    const fileMenuHandlerConvertReplaceExtension = (
      menu: Menu,
      file: TFile,
    ) => {
      if (file instanceof TFile && file.extension == "excalidraw") {
        menu.addItem((item: MenuItem) => {
          item.setTitle(t("CONVERT_FILE_REPLACE_EXT")).onClick(() => {
            this.convertSingleExcalidrawToMD(file, true, true);
          });
        });
      }
    };

    this.registerEvent(
      this.app.workspace.on(
        "file-menu",
        fileMenuHandlerConvertReplaceExtension,
      ),
    );

    this.addCommand({
      id: "excalidraw-convert-image-from-url-to-local-file",
      name: t("CONVERT_URL_TO_FILE"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if(!view) return false;
        const img = view.getSingleSelectedImage();
        if(!img || !img.embeddedFile?.isHyperLink) return false;
        if(checking) return true;
        view.convertImageElWithURLToLocalFile(img);
      },
    });

    this.addCommand({
      id: "excalidraw-unzip-file",
      name: t("UNZIP_CURRENT_FILE"),
      checkCallback: (checking: boolean) => {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
          return false;
        }
        const fileIsExcalidraw = this.isExcalidrawFile(activeFile);
        if (!fileIsExcalidraw) {
          return false;
        }

        const excalidrawView = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (excalidrawView) {
          return false;
        }

        if (checking) {
          return true;
        }

        (async () => {
          const data = await this.app.vault.read(activeFile);
          const parts = data.split("\n## Drawing\n```compressed-json\n");
          if(parts.length!==2) return;
          const header = parts[0] + "\n## Drawing\n```json\n";
          const compressed = parts[1].split("\n```\n%%");
          if(compressed.length!==2) return;
          const decompressed = decompress(compressed[0]);
          if(!decompressed) {
            new Notice("The compressed string is corrupted. Unable to decompress data.");
            return;
          }
          await this.app.vault.modify(activeFile,header + decompressed + "\n```\n%%" + compressed[1]);
        })();

      }
    })

    this.addCommand({
      id: "excalidraw-publish-svg-check",
      name: t("PUBLISH_SVG_CHECK"),
      checkCallback: (checking: boolean) => {
        const publish = app.internalPlugins.plugins["publish"].instance;
        if (!publish) {
          return false;
        }
        if (checking) {
          return true;
        }
        (new PublishOutOfDateFilesDialog(this)).open();
      }
    })

    this.addCommand({
      id: "excalidraw-embeddable-poroperties",
      name: t("EMBEDDABLE_PROPERTIES"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if(!view) return false;
        if(!view.excalidrawAPI) return false;
        const els = view.getViewSelectedElements().filter(el=>el.type==="embeddable") as ExcalidrawEmbeddableElement[];
        if(els.length !== 1) {
          if(checking) return false;
          new Notice("Select a single embeddable element and try again");
          return false;
        }
        if(checking) return true;
        const getFile = (el:ExcalidrawEmbeddableElement):TFile => {
          const res = REGEX_LINK.getRes(el.link).next();
          if(!res || (!res.value && res.done)) {
            return null;
          }
          const link = REGEX_LINK.getLink(res);
          const { file } = processLinkText(link, view);
          return file;
        }
        new EmbeddableSettings(view.plugin,view,getFile(els[0]),els[0]).open();
      }
    })

    this.addCommand({
      id: "excalidraw-embeddables-relative-scale",
      name: t("EMBEDDABLE_RELATIVE_ZOOM"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if(!view) return false;
        if(!view.excalidrawAPI) return false;
        const els = view.getViewSelectedElements().filter(el=>el.type==="embeddable") as ExcalidrawEmbeddableElement[];
        if(els.length === 0) {
          if(checking) return false;
          new Notice("Select at least one embeddable element and try again");
          return false;
        }
        if(checking) return true;
        const ea = getEA(view) as ExcalidrawAutomate;
        const api = ea.getExcalidrawAPI() as ExcalidrawImperativeAPI;
        ea.copyViewElementsToEAforEditing(els);
        const scale = 1/api.getAppState().zoom.value;
        ea.getElements().forEach((el: Mutable<ExcalidrawEmbeddableElement>)=>{
          el.scale = [scale,scale];
        })
        ea.addElementsToView().then(()=>ea.destroy());
      }
    })

    this.addCommand({
      id: "open-image-excalidraw-source",
      name: t("OPEN_IMAGE_SOURCE"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if(!view) return false;
        if(view.leaf !== this.app.workspace.activeLeaf) return false;
        const editor = view.editor;
        if(!editor) return false;
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const fname = extractSVGPNGFileName(line);
        if(!fname) return false;
        const imgFile = this.app.metadataCache.getFirstLinkpathDest(fname, view.file.path);
        if(!imgFile) return false;
        const excalidrawFname = getIMGFilename(imgFile.path, "md");
        let excalidrawFile = this.app.metadataCache.getFirstLinkpathDest(excalidrawFname, view.file.path);
        if(!excalidrawFile) {
          if(excalidrawFname.endsWith(".dark.md")) {
            excalidrawFile = this.app.metadataCache.getFirstLinkpathDest(excalidrawFname.replace(/\.dark\.md$/,".md"), view.file.path);
          }
          if(excalidrawFname.endsWith(".light.md")) {
            excalidrawFile = this.app.metadataCache.getFirstLinkpathDest(excalidrawFname.replace(/\.light\.md$/,".md"), view.file.path);
          }
          if(!excalidrawFile) return false;
        }
        if(checking) return true;
        this.openDrawing(excalidrawFile, "new-tab", true);
      }
    });

    this.addCommand({
      id: "excalidraw-disable-autosave",
      name: t("TEMPORARY_DISABLE_AUTOSAVE"),
      checkCallback: (checking) => {
        if(!this.settings.autosave) return false; //already disabled
        if(checking) return true;
        this.settings.autosave = false;
        return true;
      }
    })

    this.addCommand({
      id: "excalidraw-enable-autosave",
      name: t("TEMPORARY_ENABLE_AUTOSAVE"),
      checkCallback: (checking) => {
        if(this.settings.autosave) return false; //already enabled
        if(checking) return true;
        this.settings.autosave = true;
        return true;
      }
    })    

    this.addCommand({
      id: "excalidraw-download-lib",
      name: t("DOWNLOAD_LIBRARY"),
      callback: this.exportLibrary,
    });

    this.addCommand({
      id: "excalidraw-open",
      name: t("OPEN_EXISTING_NEW_PANE"),
      callback: () => {
        this.openDialog.start(openDialogAction.openFile, true);
      },
    });

    this.addCommand({
      id: "excalidraw-open-on-current",
      name: t("OPEN_EXISTING_ACTIVE_PANE"),
      callback: () => {
        this.openDialog.start(openDialogAction.openFile, false);
      },
    });

    this.addCommand({
      id: "excalidraw-insert-transclusion",
      name: t("TRANSCLUDE"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(MarkdownView)) 
        }
        this.openDialog.start(openDialogAction.insertLinkToDrawing, false);
        return true;
      },
    });

    this.addCommand({
      id: "excalidraw-insert-last-active-transclusion",
      name: t("TRANSCLUDE_MOST_RECENT"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return (
            Boolean(this.app.workspace.getActiveViewOfType(MarkdownView)) &&
            this.lastActiveExcalidrawFilePath !== null
          );
        }
        const file = this.app.vault.getAbstractFileByPath(
          this.lastActiveExcalidrawFilePath,
        );
        if (!(file instanceof TFile)) {
          return false;
        }
        this.embedDrawing(file);
        return true;
      },
    });

    this.addCommand({
      id: "excalidraw-autocreate",
      name: t("NEW_IN_NEW_PANE"),
      callback: () => {
        this.createAndOpenDrawing(getDrawingFilename(this.settings), "new-pane");
      },
    });

    this.addCommand({
      id: "excalidraw-autocreate-newtab",
      name: t("NEW_IN_NEW_TAB"),
      callback: () => {
        this.createAndOpenDrawing(getDrawingFilename(this.settings), "new-tab");
      },
    });

    this.addCommand({
      id: "excalidraw-autocreate-on-current",
      name: t("NEW_IN_ACTIVE_PANE"),
      callback: () => {
        this.createAndOpenDrawing(getDrawingFilename(this.settings), "active-pane");
      },
    });

    this.addCommand({
      id: "excalidraw-autocreate-popout",
      name: t("NEW_IN_POPOUT_WINDOW"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return !DEVICE.isMobile;
        }
        this.createAndOpenDrawing(getDrawingFilename(this.settings), "popout-window");
      },
    });

    const insertDrawingToDoc = async (
      location: PaneTarget
    ) => {
      const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!activeView) {
        return;
      }
      const filename = getEmbedFilename(
        activeView.file.basename,
        this.settings,
      );
      const folder = this.settings.embedUseExcalidrawFolder
        ? null
        : (
            await getAttachmentsFolderAndFilePath(
              this.app,
              activeView.file.path,
              filename,
            )
          ).folder;
      const file = await this.createDrawing(filename, folder);
      await this.embedDrawing(file);
      this.openDrawing(file, location, true, undefined, true);
    };

    this.addCommand({
      id: "excalidraw-autocreate-and-embed",
      name: t("NEW_IN_NEW_PANE_EMBED"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(MarkdownView));
        }
        insertDrawingToDoc("new-pane");
        return true;
      },
    });

    this.addCommand({
      id: "excalidraw-autocreate-and-embed-new-tab",
      name: t("NEW_IN_NEW_TAB_EMBED"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(MarkdownView));
        }
        insertDrawingToDoc("new-tab");
        return true;
      },
    });

    this.addCommand({
      id: "excalidraw-autocreate-and-embed-on-current",
      name: t("NEW_IN_ACTIVE_PANE_EMBED"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(MarkdownView));
        }
        insertDrawingToDoc("active-pane");
        return true;
      },
    });

    this.addCommand({
      id: "excalidraw-autocreate-and-embed-popout",
      name: t("NEW_IN_POPOUT_WINDOW_EMBED"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return !DEVICE.isMobile && Boolean(this.app.workspace.getActiveViewOfType(MarkdownView));
        }
        insertDrawingToDoc("popout-window");
        return true;
      },
    });    

    this.addCommand({
      id: "run-ocr",
      name: t("RUN_OCR"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (checking) {
          return (
            Boolean(view)
          );
        }
        if (view) {
          if(!this.settings.taskboneEnabled) {
            new Notice("Taskbone OCR is not enabled. Please go to plugins settings to enable it.",4000);
            return true;
          }
          this.taskbone.getTextForView(view, {forceReScan: false});
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "rerun-ocr",
      name: t("RERUN_OCR"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (checking) {
          return (
            Boolean(view)
          );
        }
        if (view) {
          if(!this.settings.taskboneEnabled) {
            new Notice("Taskbone OCR is not enabled. Please go to plugins settings to enable it.",4000);
            return true;
          }
          this.taskbone.getTextForView(view, {forceReScan: true});
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "run-ocr-selectedelements",
      name: t("RUN_OCR_ELEMENTS"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (checking) {
          return (
            Boolean(view)
          );
        }
        if (view) {
          if(!this.settings.taskboneEnabled) {
            new Notice("Taskbone OCR is not enabled. Please go to plugins settings to enable it.",4000);
            return true;
          }
          this.taskbone.getTextForView(view, {forceReScan: false, selectedElementsOnly: true, addToFrontmatter: false});
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "search-text",
      name: t("SEARCH"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return (
            Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          search(view);
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "fullscreen",
      name: t("TOGGLE_FULLSCREEN"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return (
            Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          if (view.isFullscreen()) {
            view.exitFullscreen();
          } else {
            view.gotoFullscreen();
          }
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "disable-binding",
      name: t("TOGGLE_DISABLEBINDING"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return (
            Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          view.toggleDisableBinding();
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "disable-framerendering",
      name: t("TOGGLE_FRAME_RENDERING"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return (
            Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          view.toggleFrameRendering();
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "frame-settings",
      name: t("FRAME_SETTINGS_TITLE"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return (
            Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          showFrameSettings(getEA(view));
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "copy-link-to-drawing",
      name: t("COPY_DRAWING_LINK"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return (
            Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          navigator.clipboard.writeText(`![[${view.file.path}]]`);
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "disable-frameclipping",
      name: t("TOGGLE_FRAME_CLIPPING"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return (
            Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          view.toggleFrameClipping();
          return true;
        }
        return false;
      },
    });


    this.addCommand({
      id: "export-image",
      name: t("EXPORT_IMAGE"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return (
            Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
          );
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          if(!view.exportDialog) {
            view.exportDialog = new ExportDialog(this, view,view.file);
            view.exportDialog.createForm();
          }
          view.exportDialog.open();
          return true;
        }
        return false;
      },
    });

    this.forceSaveCommand = this.addCommand({
      id: "save",
      hotkeys: [{modifiers: ["Ctrl"], key:"s"}], //See also Poposcope
      name: t("FORCE_SAVE"),
      checkCallback: (checking:boolean) => this.forceSaveActiveView(checking),
    })

    this.addCommand({
      id: "toggle-lock",
      name: t("TOGGLE_LOCK"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          if (
            Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
          ) {
            return !(this.app.workspace.getActiveViewOfType(ExcalidrawView))
              .compatibilityMode;
          }
          return false;
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view && !view.compatibilityMode) {
          view.changeTextMode(
            view.textMode === TextMode.parsed ? TextMode.raw : TextMode.parsed,
          );
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "scriptengine-store",
      name: t("INSTALL_SCRIPT_BUTTON"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return (
            Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
          );
        }
        new ScriptInstallPrompt(this).open();
        return true;
      },
    });

    this.addCommand({
      id: "delete-file",
      name: t("DELETE_FILE"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          this.ea.reset();
          this.ea.setView(view);
          const el = this.ea.getViewSelectedElement();
          if (el.type !== "image") {
            new Notice(
              "Please select an image or embedded markdown document",
              4000,
            );
            return true;
          }
          const file = this.ea.getViewFileForImageElement(el);
          if (!file) {
            new Notice(
              "Please select an image or embedded markdown document",
              4000,
            );
            return true;
          }
          this.app.vault.delete(file);
          this.ea.deleteViewElements([el]);
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "convert-text2MD",
      name: t("CONVERT_TO_MARKDOWN"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView)
        if(!view) return false;
        const selectedTextElements = view.getViewSelectedElements().filter(el=>el.type === "text");
        if(selectedTextElements.length !==1 ) return false;
        const selectedTextElement = selectedTextElements[0] as ExcalidrawTextElement;
        const containerElement = (view.getViewElements() as ExcalidrawElement[]).find(el=>el.id === selectedTextElement.containerId);
        if(containerElement && containerElement.type === "arrow") return false;
        if(checking) return true;
        view.convertTextElementToMarkdown(selectedTextElement, containerElement);
      }
    })

    this.addCommand({
      id: "insert-link",
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "k" }],
      name: t("INSERT_LINK"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          this.insertLinkDialog.start(view.file.path, (markdownlink: string, path:string, alias:string) => view.addLink(markdownlink, path, alias));
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "insert-command",
      name: t("INSERT_COMMAND"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          this.insertCommandDialog.start((text: string, fontFamily?: 1 | 2 | 3 | 4, save?: boolean) => view.addText(text, fontFamily, save));
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "insert-link-to-element",
      name: t("INSERT_LINK_TO_ELEMENT_NORMAL"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          view.copyLinkToSelectedElementToClipboard("");
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "insert-link-to-element-group",
      name: t("INSERT_LINK_TO_ELEMENT_GROUP"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          view.copyLinkToSelectedElementToClipboard("group=");
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "insert-link-to-element-frame",
      name: t("INSERT_LINK_TO_ELEMENT_FRAME"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView));
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          view.copyLinkToSelectedElementToClipboard("frame=");
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "insert-link-to-element-frame-clipped",
      name: t("INSERT_LINK_TO_ELEMENT_FRAME_CLIPPED"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView));
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          view.copyLinkToSelectedElementToClipboard("clippedframe=");
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "insert-link-to-element-area",
      name: t("INSERT_LINK_TO_ELEMENT_AREA"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          view.copyLinkToSelectedElementToClipboard("area=");
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "toggle-lefthanded-mode",
      name: t("TOGGLE_LEFTHANDED_MODE"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          if(this.app.workspace.getActiveViewOfType(ExcalidrawView)) {
            const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
            const api = view?.excalidrawAPI;
            if(!api) return false;
            const st = api.getAppState();
            if(!st.trayModeEnabled) return false;
            return true;
          }
          return false;
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        (async()=>{
          const isLeftHanded = this.settings.isLeftHanded;
          await this.loadSettings({applyLefthandedMode: false});
          this.settings.isLeftHanded = !isLeftHanded;
          this.saveSettings();
          //not clear why I need to do this. If I don't double apply the stylesheet changes 
          //then the style won't be applied in the popout windows
          setLeftHandedMode(!isLeftHanded);
          setTimeout(()=>setLeftHandedMode(!isLeftHanded));
        })()
        return true;
      },
    });

    this.addCommand({
      id: "flip-image",
      name: t("FLIP_IMAGE"),
      checkCallback: (checking:boolean) => {
        if (!DEVICE.isDesktop) return;
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if(!view) return false;
        if(!view.excalidrawAPI) return false;
        const els = view
          .getViewSelectedElements()
          .filter(el=>{
            if(el.type==="image") {
              const ef = view.excalidrawData.getFile(el.fileId);
              if(!ef) {
                return false;
              }
              return this.isExcalidrawFile(ef.file);
            }
            return false;
          });
        if(els.length !== 1) {
          return false;
        }
        if(checking) return true;
        const el = els[0] as ExcalidrawImageElement;
        let ef = view.excalidrawData.getFile(el.fileId);
        this.forceToOpenInMarkdownFilepath = ef.file?.path;
        const appState = view.excalidrawAPI.getAppState();
        const {x:centerX,y:centerY} = sceneCoordsToViewportCoords({sceneX:el.x+el.width/2,sceneY:el.y+el.height/2},appState);
        const {width, height} = {width:600, height:600};
        const {x,y} = {
          x:Math.max(0,centerX - width/2 + view.ownerWindow.screenX),
          y:Math.max(0,centerY - height/2 + view.ownerWindow.screenY),
        }
      
        this.openDrawing(ef.file, DEVICE.isMobile ? "new-tab":"popout-window", true, undefined, false, {x,y,width,height});
      }
    })

    this.addCommand({
      id: "reset-image-to-100",
      name: t("RESET_IMG_TO_100"),
      checkCallback: (checking:boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if(!view) return false;
        if(!view.excalidrawAPI) return false;
        const els = view.getViewSelectedElements().filter(el=>el.type==="image");
        if(els.length !== 1) {
          if(checking) return false;
          new Notice("Select a single image element and try again");
          return false;
        }
        if(checking) return true;
        
        (async () => {
          const el = els[0] as ExcalidrawImageElement;
          let ef = view.excalidrawData.getFile(el.fileId);
          if(!ef) {
            await view.forceSave();
            let ef = view.excalidrawData.getFile(el.fileId);
            new Notice("Select a single image element and try again");
            return false;
          }
  
          const ea = new ExcalidrawAutomate(this,view);
          const size = await ea.getOriginalImageSize(el);
          if(size) {
            ea.copyViewElementsToEAforEditing(els);
            const eaEl = ea.getElement(el.id);
            //@ts-ignore
            eaEl.width = size.width; eaEl.height = size.height;
            await ea.addElementsToView(false,false,false);
          }
          ea.destroy();
        })()
      }
    })

    this.addCommand({
      id: "reset-image-ar",
      name: t("RESET_IMG_ASPECT_RATIO"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (!view) return false;
        if (!view.excalidrawAPI) return false;
        const els = view.getViewSelectedElements().filter(el => el.type === "image");
        if (els.length !== 1) {
          if (checking) return false;
          new Notice("Select a single image element and try again");
          return false;
        }
        if (checking) return true;
    
        (async () => {
          const el = els[0] as ExcalidrawImageElement;
          let ef = view.excalidrawData.getFile(el.fileId);
          if (!ef) {
            await view.forceSave();
            let ef = view.excalidrawData.getFile(el.fileId);
            new Notice("Select a single image element and try again");
            return false;
          }
    
          const ea = new ExcalidrawAutomate(this, view);
          if (await ea.resetImageAspectRatio(el)) {
            await ea.addElementsToView(false, false, false);
          }
          ea.destroy();
        })();
      }
    });
    
    this.addCommand({
      id: "open-link-props",
      name: t("OPEN_LINK_PROPS"),
      checkCallback: (checking: boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (!view) return false;
        if (!view.excalidrawAPI) return false;
        const els = view.getViewSelectedElements().filter(el => el.type === "image");
        if (els.length !== 1) {
          if (checking) return false;
          new Notice("Select a single image element and try again");
          return false;
        }
        if (checking) return true;

        const el = els[0] as ExcalidrawImageElement;
        let ef = view.excalidrawData.getFile(el.fileId);
        let eq = view.excalidrawData.getEquation(el.fileId);
        if (!ef && !eq) {
          view.forceSave();
          new Notice("Please try again.");
          return false;
        }

        if(ef) {
          view.openEmbeddedLinkEditor(el.id);
        }
        if(eq) {
          view.openLaTeXEditor(el.id);
        }
      }
    });

    this.addCommand({
      id: "convert-card-to-file",
      name: t("CONVERT_CARD_TO_FILE"),
      checkCallback: (checking:boolean) => {
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if(!view) return false;
        if(!view.excalidrawAPI) return false;
        const els = view.getViewSelectedElements().filter(el=>el.type==="embeddable");
        if(els.length !== 1) {
          if(checking) return false;
          new Notice("Select a single back-of-the-note card and try again");
          return false;
        }
        const embeddableData = view.getEmbeddableLeafElementById(els[0].id);
        const child = embeddableData?.node?.child;
        if(!child || (child.file !== view.file)) {
          if(checking) return false;
          new Notice("The selected embeddable is not a back-of-the-note card.");
          return false;
        }
        if(checking) return true;
        view.moveBackOfTheNoteCardToFile();
      }
    })

    this.addCommand({
      id: "insert-active-pdfpage",
      name: t("INSERT_ACTIVE_PDF_PAGE_AS_IMAGE"),
      checkCallback: (checking:boolean) => {
        const excalidrawView = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if(!excalidrawView) return false;
        const embeddables = excalidrawView.getViewSelectedElements().filter(el=>el.type==="embeddable");
        if(embeddables.length !== 1) {
          if(checking) return false;
          new Notice("Select a single PDF embeddable and try again");
          return false;
        }
        const isPDF = excalidrawView.getEmbeddableLeafElementById(embeddables[0].id)?.leaf?.view?.getViewType() === "pdf"
        if(!isPDF) return false;
        const page = getActivePDFPageNumberFromPDFView(excalidrawView.getEmbeddableLeafElementById(embeddables[0].id)?.leaf?.view);
        if(!page) return false;
        if(checking) return true;

        const embeddableEl = embeddables[0] as ExcalidrawEmbeddableElement;
        const ea = new ExcalidrawAutomate(this,excalidrawView);
        //@ts-ignore
        const pdfFile: TFile = excalidrawView.getEmbeddableLeafElementById(embeddableEl.id)?.leaf?.view?.file;
        (async () => {
          const imgID = await ea.addImage(embeddableEl.x + embeddableEl.width + 10, embeddableEl.y, `${pdfFile?.path}#page=${page}`, false, false);
          const imgEl = ea.getElement(imgID) as Mutable<ExcalidrawImageElement>;
          const imageAspectRatio = imgEl.width / imgEl.height;
          if(imageAspectRatio > 1) {
            imgEl.width = embeddableEl.width;
            imgEl.height = embeddableEl.width / imageAspectRatio;
          } else {
            imgEl.height = embeddableEl.height;
            imgEl.width = embeddableEl.height * imageAspectRatio;
          }
          ea.addElementsToView(false, true, true);
        })()
      }
    })

    this.addCommand({
      id: "crop-image",
      name: t("CROP_IMAGE"),
      checkCallback: (checking:boolean) => {
        const excalidrawView = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
        const canvasView:any = this.app.workspace.activeLeaf?.view;
        const isCanvas = canvasView && canvasView.getViewType() === "canvas";
        if(!excalidrawView && !markdownView && !isCanvas) return false;

        if(excalidrawView) {
          if(!excalidrawView.excalidrawAPI) return false;
          const embeddables = excalidrawView.getViewSelectedElements().filter(el=>el.type==="embeddable");
          const imageEls = excalidrawView.getViewSelectedElements().filter(el=>el.type==="image");
          const isPDF = (imageEls.length === 0 && embeddables.length === 1 && excalidrawView.getEmbeddableLeafElementById(embeddables[0].id)?.leaf?.view?.getViewType() === "pdf")
          const isImage = (imageEls.length === 1 && embeddables.length === 0)

          if(!isPDF && !isImage) {
            if(checking) return false;
            new Notice("Select a single image element or single PDF embeddable and try again");
            return false;
          }

          //@ts-ignore
          const page = isPDF ? getActivePDFPageNumberFromPDFView(excalidrawView.getEmbeddableLeafElementById(embeddables[0].id)?.leaf?.view) : undefined;
          if(isPDF && !page) {
            return false;
          }

          if(checking) return true;

          if(isPDF) {
            const embeddableEl = embeddables[0] as ExcalidrawEmbeddableElement;
            const ea = new ExcalidrawAutomate(this,excalidrawView);
            //@ts-ignore
            const pdfFile: TFile = excalidrawView.getEmbeddableLeafElementById(embeddableEl.id)?.leaf?.view?.file;
            carveOutPDF(ea, embeddableEl, `${pdfFile?.path}#page=${page}`, pdfFile);
            return;
          }

          const imageEl = imageEls[0] as ExcalidrawImageElement;
          (async () => {
            let ef = excalidrawView.excalidrawData.getFile(imageEl.fileId);

            if(!ef) {
              await excalidrawView.save();
              await sleep(500);
              ef = excalidrawView.excalidrawData.getFile(imageEl.fileId);
              if(!ef) {             
                new Notice("Select a single image element and try again");
                return false;
              }
            }
            const ea = new ExcalidrawAutomate(this,excalidrawView);
            carveOutImage(ea, imageEl);
          })();
        }

        const carveout = async (isFile: boolean, sourceFile: TFile, imageFile: TFile, imageURL: string, replacer: Function, ref?: string) => {
          const ea = getEA() as ExcalidrawAutomate;
          const imageID = await ea.addImage(
            0, 0,
            isFile
              ? ((isFile && imageFile.extension === "pdf" && ref) ? `${imageFile.path}#${ref}` : imageFile)
              : imageURL,
            false, false
          );
          if(!imageID) {
            new Notice(`Can't load image\n\n${imageURL}`);
            return;
          }
          
          let fnBase = "";
          let imageLink = "";
          if(isFile) {
            fnBase = imageFile.basename;
            imageLink = ref
              ? `[[${imageFile.path}#${ref}]]`
              : `[[${imageFile.path}]]`;
          } else {
            imageLink = imageURL;
            const imagename = imageURL.match(/^.*\/([^?]*)\??.*$/)?.[1];
            fnBase = imagename.substring(0,imagename.lastIndexOf("."));
          }
          
          const {folderpath, filename} = await getCropFileNameAndFolder(this,sourceFile.path,fnBase)
          const newFile = await createImageCropperFile(ea,imageID,imageLink,folderpath,filename);
          ea.destroy();
          if(!newFile) return;
          const link = this.app.metadataCache.fileToLinktext(newFile,sourceFile.path, true);
          replacer(link, newFile);
        }

        if(isCanvas) {
          const selectedNodes:any = [];
          canvasView.canvas.nodes.forEach((node:any) => {
            if(node.nodeEl.hasClass("is-focused")) selectedNodes.push(node);
          })
          if(selectedNodes.length !== 1) return false;
          const node = selectedNodes[0];
          let extension = "";
          let isExcalidraw = false;
          if(node.file) {
            extension = node.file.extension;
            isExcalidraw = this.isExcalidrawFile(node.file);
          }
          if(node.url) {
            extension = getURLImageExtension(node.url);
          }
          const page = extension === "pdf" ? getActivePDFPageNumberFromPDFView(node?.child) : undefined;
          if(!page && !IMAGE_TYPES.contains(extension) && !isExcalidraw) return false;
          if(checking) return true;

          const replacer = (link:string, file: TFile) => {
            if(node.file) {
              (node.file.extension === "pdf")
                ? node.canvas.createFileNode({pos:{x:node.x + node.width + 10,y: node.y}, file})
                : node.setFile(file);
            }
            if(node.url) {
              node.canvas.createFileNode({pos:{x:node.x + 20,y: node.y+20}, file});
            }
          }
          carveout(Boolean(node.file), canvasView.file, node.file, node.url, replacer, page ? `page=${page}` : undefined);
        }

        if (markdownView) {
          const editor = markdownView.editor;
          const cursor = editor.getCursor();
          const line = editor.getLine(cursor.line);
          const parts = REGEX_LINK.getResList(line);
          if(parts.length === 0) return false;
          let imgpath = REGEX_LINK.getLink(parts[0]);
          const isWikilink = REGEX_LINK.isWikiLink(parts[0]);
          let alias = REGEX_LINK.getAliasOrLink(parts[0]);
          if(alias === imgpath) alias = null;
          imgpath = decodeURI(imgpath);
          const imagePathParts = imgpath.split("#");
          const hasRef = imagePathParts.length === 2;
          const imageFile = this.app.metadataCache.getFirstLinkpathDest(
            hasRef ? imagePathParts[0] : imgpath,
            markdownView.file.path
          );
          const isFile = (imageFile && imageFile instanceof TFile);
          const isExcalidraw = isFile ? this.isExcalidrawFile(imageFile) : false;
          let imagepath = isFile ? imageFile.path : "";
          let extension = isFile ? imageFile.extension : "";
          if(imgpath.match(/^https?|file/)) {
            imagepath = imgpath;
            extension = getURLImageExtension(imgpath);
          }
          if(imagepath === "") return false;
          if(extension !== "pdf" && !IMAGE_TYPES.contains(extension) && !isExcalidraw) return false;
          if(checking) return true;
          const ref = imagePathParts[1];
          const replacer = (link:string) => {
            const lineparts = line.split(parts[0].value[0]) 
            const pdfLink = isFile && ref 
              ? "\n" + getLink(this ,{
                  embed: false,
                  alias: alias ?? `${imageFile.basename}, ${ref.replace("="," ")}`,
                  path:`${imageFile.path}#${ref}`
                }, isWikilink) 
              : "";
            editor.setLine(cursor.line,lineparts[0] + getLink(this ,{embed: true, path:link, alias}, isWikilink) + pdfLink + lineparts[1]);
          }
          carveout(isFile, markdownView.file, imageFile, imagepath, replacer, ref);
        }
      }
    })

    this.addCommand({
      id: "annotate-image",
      name: t("ANNOTATE_IMAGE"),
      checkCallback: (checking:boolean) => {
        const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
        const canvasView:any = this.app.workspace.activeLeaf?.view;
        const isCanvas = canvasView && canvasView.getViewType() === "canvas";
        if(!markdownView && !isCanvas) return false;

        const carveout = async (isFile: boolean, sourceFile: TFile, imageFile: TFile, imageURL: string, replacer: Function, ref?: string) => {
          const ea = getEA() as ExcalidrawAutomate;
          const imageID = await ea.addImage(
            0, 0,
            isFile
              ? ((isFile && imageFile.extension === "pdf" && ref) ? `${imageFile.path}#${ref}` : imageFile)
              : imageURL,
            false, false
          );
          if(!imageID) {
            new Notice(`Can't load image\n\n${imageURL}`);
            ea.destroy();
            return;
          }
          const el = ea.getElement(imageID) as Mutable<ExcalidrawImageElement>;
          el.locked = true;
          const size = this.settings.annotatePreserveSize
            ? await getImageSize(ea.imagesDict[el.fileId].dataURL)
            : null;
          let fnBase = "";
          let imageLink = "";
          if(isFile) {
            fnBase = imageFile.basename;
            imageLink = ref
              ? `[[${imageFile.path}#${ref}]]`
              : `[[${imageFile.path}]]`;
          } else {
            imageLink = imageURL;
            const imagename = imageURL.match(/^.*\/([^?]*)\??.*$/)?.[1];
            fnBase = imagename.substring(0,imagename.lastIndexOf("."));
          }
          
          let template:TFile;
          const templates = getListOfTemplateFiles(this);
          if(templates) {
            template = await templatePromt(templates, this.app);
          }

          const {folderpath, filename} = await getAnnotationFileNameAndFolder(this,sourceFile.path,fnBase)
          const newPath = await ea.create ({
            templatePath: template?.path,
            filename,
            foldername: folderpath,
            onNewPane: true,
            frontmatterKeys: {
              ...this.settings.matchTheme ? {"excalidraw-export-dark": isObsidianThemeDark()} : {},
              ...(imageFile.extension === "pdf") ? {"cssclasses": "excalidraw-cropped-pdfpage"} : {},
            }
          });
          ea.destroy();

          //wait for file to be created/indexed by Obsidian
          let newFile = this.app.vault.getAbstractFileByPath(newPath);
          let counter = 0;
          while((!newFile || !this.isExcalidrawFile(newFile as TFile)) && counter < 50) {
            await sleep(100);
            newFile = this.app.vault.getAbstractFileByPath(newPath);
            counter++;
          }
          //console.log({counter, file});
          if(!newFile || !(newFile instanceof TFile)) {
            new Notice("File not found. NewExcalidraw Drawing is taking too long to create. Please try again.");
            return;
          }

          if(!newFile) return;
          const link = this.app.metadataCache.fileToLinktext(newFile,sourceFile.path, true);
          replacer(link, newFile, size ? `${size.width}` : null);
        }

        if(isCanvas) {
          const selectedNodes:any = [];
          canvasView.canvas.nodes.forEach((node:any) => {
            if(node.nodeEl.hasClass("is-focused")) selectedNodes.push(node);
          })
          if(selectedNodes.length !== 1) return false;
          const node = selectedNodes[0];
          let extension = "";
          let isExcalidraw = false;
          if(node.file) {
            extension = node.file.extension;
            isExcalidraw = this.isExcalidrawFile(node.file);
          }
          if(node.url) {
            extension = getURLImageExtension(node.url);
          }
          const page = extension === "pdf" ? getActivePDFPageNumberFromPDFView(node?.child) : undefined;
          if(!page && !IMAGE_TYPES.contains(extension) && !isExcalidraw) return false;
          if(checking) return true;

          const replacer = (link:string, file: TFile) => {
            if(node.file) {
              (node.file.extension === "pdf")
                ? node.canvas.createFileNode({pos:{x:node.x + node.width + 10,y: node.y}, file})
                : node.setFile(file);
            }
            if(node.url) {
              node.canvas.createFileNode({pos:{x:node.x + 20,y: node.y+20}, file});
            }
          }
          carveout(Boolean(node.file), canvasView.file, node.file, node.url, replacer, page ? `page=${page}` : undefined);
        }

        if (markdownView) {
          const editor = markdownView.editor;
          const cursor = editor.getCursor();
          const line = editor.getLine(cursor.line);
          const parts = REGEX_LINK.getResList(line);
          if(parts.length === 0) return false;
          let imgpath = REGEX_LINK.getLink(parts[0]);
          const isWikilink = REGEX_LINK.isWikiLink(parts[0]);
          let alias = REGEX_LINK.getAliasOrLink(parts[0]);
          if(alias === imgpath) alias = null;
          imgpath = decodeURI(imgpath);
          const imagePathParts = imgpath.split("#");
          const hasRef = imagePathParts.length === 2;
          const imageFile = this.app.metadataCache.getFirstLinkpathDest(
            hasRef ? imagePathParts[0] : imgpath,
            markdownView.file.path
          );
          const isFile = (imageFile && imageFile instanceof TFile);
          const isExcalidraw = isFile ? this.isExcalidrawFile(imageFile) : false;
          let imagepath = isFile ? imageFile.path : "";
          let extension = isFile ? imageFile.extension : "";
          if(imgpath.match(/^https?|file/)) {
            imagepath = imgpath;
            extension = getURLImageExtension(imgpath);
          }
          if(imagepath === "") return false;
          if(extension !== "pdf" && !IMAGE_TYPES.contains(extension) && !isExcalidraw) return false;
          if(checking) return true;
          const ref = imagePathParts[1];
          const replacer = (link:string, _:TFile, size:string) => {
            const lineparts = line.split(parts[0].value[0]) 
            const pdfLink = isFile && ref 
              ? "\n" + getLink(this ,{
                  embed: false,
                  alias: getAliasWithSize(alias ?? `${imageFile.basename}, ${ref.replace("="," ")}`,size),
                  path:`${imageFile.path}#${ref}`
                }, isWikilink) 
              : "";
            editor.setLine(
              cursor.line,
              lineparts[0] + getLink(this ,{embed: true, path:link, alias: getAliasWithSize(alias,size)}, isWikilink) + pdfLink + lineparts[1]
            );
          }
          carveout(isFile, markdownView.file, imageFile, imagepath, replacer, ref);
        }
      }
    })

    this.addCommand({
      id: "insert-image",
      name: t("INSERT_IMAGE"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          this.insertImageDialog.start(view);
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "import-svg",
      name: t("IMPORT_SVG"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          this.importSVGDialog.start(view);
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "release-notes",
      name: t("READ_RELEASE_NOTES"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
        }
        new ReleaseNotes(this.app, this, PLUGIN_VERSION).open();
        return true;
      },
    });

    this.addCommand({
      id: "tray-mode",
      name: t("TRAY_MODE"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
          if (!view || !view.excalidrawAPI) {
            return false;
          }
          const st = view.excalidrawAPI.getAppState();
          if (st.zenModeEnabled || st.viewModeEnabled) {
            return false;
          }
          return true;
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view && view.excalidrawAPI) {
          view.toggleTrayMode();
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "insert-md",
      name: t("INSERT_MD"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          this.insertMDDialog.start(view);
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "insert-pdf",
      name: t("INSERT_PDF"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          const insertPDFModal = new InsertPDFModal(this, view);
          insertPDFModal.open();
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "universal-add-file",
      name: t("UNIVERSAL_ADD_FILE"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          const insertFileModal = new UniversalInsertFileModal(this, view);
          insertFileModal.open();
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "universal-card",
      name: t("INSERT_CARD"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          view.insertBackOfTheNoteCard();
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "insert-LaTeX-symbol",
      name: t("INSERT_LATEX"),
      checkCallback: (checking: boolean) => {
        if (checking) {
          return Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView));
        }
        const view = this.app.workspace.getActiveViewOfType(ExcalidrawView);
        if (view) {
          insertLaTeXToView(view);
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: "toggle-excalidraw-view",
      name: t("TOGGLE_MODE"),
      checkCallback: (checking) => {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
          return false;
        }
        const fileIsExcalidraw = this.isExcalidrawFile(activeFile);

        if (checking) {
          if (
            Boolean(this.app.workspace.getActiveViewOfType(ExcalidrawView))
          ) {
            return !(this.app.workspace.getActiveViewOfType(ExcalidrawView))
              .compatibilityMode;
          }
          return fileIsExcalidraw;
        }

        const excalidrawView = this.app.workspace.getActiveViewOfType(ExcalidrawView)
        if (excalidrawView) {
          excalidrawView.openAsMarkdown();
          return;
        }

        const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView)
        if (markdownView && fileIsExcalidraw) {
          (async()=>{
            await markdownView.save();
            const activeLeaf = markdownView.leaf;
            this.excalidrawFileModes[(activeLeaf as any).id || activeFile.path] =
              VIEW_TYPE_EXCALIDRAW;
            setExcalidrawView(activeLeaf);
          })()
          return;
        }
      },
    });

    this.addCommand({
      id: "convert-to-excalidraw",
      name: t("CONVERT_NOTE_TO_EXCALIDRAW"),
      checkCallback: (checking) => {
        const activeFile = this.app.workspace.getActiveFile();
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

        if (!activeFile || !activeView) {
          return false;
        }

        if(this.isExcalidrawFile(activeFile)) {
          return false;
        }

        if(checking) {
          return true;
        }

        (async () => {
          await activeView.save();
          const template = await this.getBlankDrawing();
          const target = await this.app.vault.read(activeFile);
          const mergedTarget = mergeMarkdownFiles(template, target);
          await this.app.vault.modify(
            activeFile,
            mergedTarget,
          );
          setExcalidrawView(activeView.leaf);
        })();
      },
    });

    this.addCommand({
      id: "convert-excalidraw",
      name: t("CONVERT_EXCALIDRAW"),
      checkCallback: (checking) => {
        if (checking) {
          const files = this.app.vault
            .getFiles()
            .filter((f) => f.extension == "excalidraw");
          return files.length > 0;
        }
        this.convertExcalidrawToMD();
        return true;
      },
    });
  }

  public async convertSingleExcalidrawToMD(
    file: TFile,
    replaceExtension: boolean = false,
    keepOriginal: boolean = false,
  ): Promise<TFile> {
    const data = await this.app.vault.read(file);
    const filename =
      file.name.substring(0, file.name.lastIndexOf(".excalidraw")) +
      (replaceExtension ? ".md" : ".excalidraw.md");
    const fname = getNewUniqueFilepath(
      this.app.vault,
      filename,
      normalizePath(file.path.substring(0, file.path.lastIndexOf(file.name))),
    );
    log(fname);
    const result = await this.app.vault.create(
      fname,
      FRONTMATTER + (await this.exportSceneToMD(data, false)),
    );
    if (this.settings.keepInSync) {
      EXPORT_TYPES.forEach((ext: string) => {
        const oldIMGpath =
          file.path.substring(0, file.path.lastIndexOf(".excalidraw")) + ext;
        const imgFile = this.app.vault.getAbstractFileByPath(
          normalizePath(oldIMGpath),
        );
        if (imgFile && imgFile instanceof TFile) {
          const newIMGpath = fname.substring(0, fname.lastIndexOf(".md")) + ext;
          this.app.fileManager.renameFile(imgFile, newIMGpath);
        }
      });
    }
    if (!keepOriginal) {
      this.app.vault.delete(file);
    }
    return result;
  }

  public async convertExcalidrawToMD(
    replaceExtension: boolean = false,
    keepOriginal: boolean = false,
  ) {
    const files = this.app.vault
      .getFiles()
      .filter((f) => f.extension == "excalidraw");
    for (const file of files) {
      this.convertSingleExcalidrawToMD(file, replaceExtension, keepOriginal);
    }
    new Notice(`Converted ${files.length} files.`);
  }

  private registerMonkeyPatches() {
    const key = "https://github.com/zsviczian/obsidian-excalidraw-plugin/issues";

    this.register(
      around(Workspace.prototype, {
        getActiveViewOfType(old) {
          return dedupe(key, old, function(...args) {
            (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.registerMonkeyPatches, `ExcalidrawPlugin.MonkeyPatch >getActiveViewOfType`, key, old, ...args);
            const result = old && old.apply(this, args);
            const maybeEAView = self.app?.workspace?.activeLeaf?.view;
            if(!maybeEAView || !(maybeEAView instanceof ExcalidrawView)) return result;
            const error = new Error();
            const stackTrace = error.stack;
            if(!isCallerFromTemplaterPlugin(stackTrace)) return result;
            const leafOrNode = maybeEAView.getActiveEmbeddable();
            if(leafOrNode) {
              if(leafOrNode.node && leafOrNode.node.isEditing) {
                return {file: leafOrNode.node.file, editor: leafOrNode.node.child.editor};
              }
            }
            return result;
        });
       }
      })
    );
    //@ts-ignore
    if(!this.app.plugins?.plugins?.["obsidian-hover-editor"]) {
      this.register( //stolen from hover editor
        around(WorkspaceLeaf.prototype, {
          getRoot(old) {
            return function () {
              const top = old.call(this);
              return top.getRoot === this.getRoot ? top : top.getRoot();
            };
          }
        }));
    }
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, editor, view) => {
        if(!view || !(view instanceof MarkdownView)) return;
        const file = view.file;
        const leaf = view.leaf;
        if (!view.file) return;
        const cache = this.app.metadataCache.getFileCache(file);
        if (!cache?.frontmatter || !cache.frontmatter[FRONTMATTER_KEYS["plugin"].name]) return;
        
        menu.addItem(item => item
          .setTitle(t("OPEN_AS_EXCALIDRAW"))
          .setIcon(ICON_NAME)
          .setSection("excalidraw")
          .onClick(async () => {
            await view.save();
            //@ts-ignore
            this.excalidrawFileModes[leaf.id || file.path] = VIEW_TYPE_EXCALIDRAW;
            setExcalidrawView(leaf);
          }));
        },
      ),
    );

    this.registerEvent(      
      this.app.workspace.on("file-menu", (menu, file, source, leaf) => {
        (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.registerMonkeyPatches, `ExcalidrawPlugin.MonkeyPatch > file-menu`, file, source, leaf);
        if (!leaf) return;
        const view = leaf.view;
        if(!view || !(view instanceof MarkdownView)) return;
        if (!(file instanceof TFile)) return;
        const cache = this.app.metadataCache.getFileCache(file);
        if (!cache?.frontmatter || !cache.frontmatter[FRONTMATTER_KEYS["plugin"].name]) return;
        
        menu.addItem(item => {
          item
          .setTitle(t("OPEN_AS_EXCALIDRAW"))
          .setIcon(ICON_NAME)
          .setSection("pane")
          .onClick(async () => {
            await view.save();
            //@ts-ignore
            this.excalidrawFileModes[leaf.id || file.path] = VIEW_TYPE_EXCALIDRAW;
            setExcalidrawView(leaf);
          })});
        //@ts-ignore
        menu.items.unshift(menu.items.pop());
        },
      ),
    );
    
    const self = this;
    // Monkey patch WorkspaceLeaf to open Excalidraw drawings with ExcalidrawView by default
    this.register(
      around(WorkspaceLeaf.prototype, {
        // Drawings can be viewed as markdown or Excalidraw, and we keep track of the mode
        // while the file is open. When the file closes, we no longer need to keep track of it.
        detach(next) {
          return function () {
            const state = this.view?.getState();

            if (
              state?.file &&
              self.excalidrawFileModes[this.id || state.file]
            ) {
              delete self.excalidrawFileModes[this.id || state.file];
            }

            return next.apply(this);
          };
        },

        setViewState(next) {
          return function (state: ViewState, ...rest: any[]) {
            (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.registerMonkeyPatches, `ExcalidrawPlugin.MonkeyPatch > setViewState`, next);
            const markdownViewLoaded = 
              self._loaded && // Don't force excalidraw mode during shutdown
              state.type === "markdown" && // If we have a markdown file
              state.state?.file;
            if (
              markdownViewLoaded &&
              self.excalidrawFileModes[this.id || state.state.file] !== "markdown"
            ) {
              const file = state.state.file;
              if ((self.forceToOpenInMarkdownFilepath !== file)  && fileShouldDefaultAsExcalidraw(file,this.app)) {
                // If we have it, force the view type to excalidraw
                const newState = {
                  ...state,
                  type: VIEW_TYPE_EXCALIDRAW,
                };

                self.excalidrawFileModes[file] =
                  VIEW_TYPE_EXCALIDRAW;

                return next.apply(this, [newState, ...rest]);
              }
              self.forceToOpenInMarkdownFilepath = null;
            }

            if(markdownViewLoaded) {
              const leaf = this;
              setTimeout(async ()=> {
                if(!leaf || !leaf.view || !(leaf.view instanceof MarkdownView) || 
                  !leaf.view.file || !self.isExcalidrawFile(leaf.view.file)
                ) return;
                foldExcalidrawSection(leaf.view)
              },500);
            }

            return next.apply(this, [state, ...rest]);
          };
        },
      }),
    );
  }

  private runStartupScript() {
    (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.runStartupScript, `ExcalidrawPlugin.runStartupScript`);
    if(!this.settings.startupScriptPath || this.settings.startupScriptPath === "") {
      return;
    }
    this.app.workspace.onLayoutReady(async () => {
      (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.runStartupScript, `ExcalidrawPlugin.runStartupScript > app.workspace.onLayoutReady, scriptPath:${this.settings?.startupScriptPath}`);
      const path = this.settings.startupScriptPath.endsWith(".md")
        ? this.settings.startupScriptPath
        : `${this.settings.startupScriptPath}.md`;
      const f = this.app.vault.getAbstractFileByPath(path);
      if (!f || !(f instanceof TFile)) {
        new Notice(`Startup script not found: ${path}`);
        return;
      }
      const script = await this.app.vault.read(f);
      const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
      try {
       await new AsyncFunction("ea", script)(this.ea);
      } catch (e) {
        new Notice(`Error running startup script: ${e}`);
      }
    });
  }

  public async activeLeafChangeEventHandler (leaf: WorkspaceLeaf) {
    (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.activeLeafChangeEventHandler,`ExcalidrawPlugin.activeLeafChangeEventHandler`, leaf);
    //https://github.com/zsviczian/obsidian-excalidraw-plugin/issues/723
    if(this.leafChangeTimeout) {
      window.clearTimeout(this.leafChangeTimeout);
    }
    this.leafChangeTimeout = window.setTimeout(()=>{this.leafChangeTimeout = null;},1000);

    const previouslyActiveEV = this.activeExcalidrawView;
    const newActiveviewEV: ExcalidrawView =
      leaf.view instanceof ExcalidrawView ? leaf.view : null;
    this.activeExcalidrawView = newActiveviewEV;

    if (newActiveviewEV) {
      this.addModalContainerObserver();
      this.lastActiveExcalidrawFilePath = newActiveviewEV.file?.path;
    } else {
      this.removeModalContainerObserver();
    }

    //!Temporary hack
    //https://discord.com/channels/686053708261228577/817515900349448202/1031101635784613968
    if (DEVICE.isMobile && newActiveviewEV && !previouslyActiveEV) {
      const navbar = document.querySelector("body>.app-container>.mobile-navbar");
      if(navbar && navbar instanceof HTMLDivElement) {
        navbar.style.position="relative";
      }
    }

    if (DEVICE.isMobile && !newActiveviewEV && previouslyActiveEV) {
      const navbar = document.querySelector("body>.app-container>.mobile-navbar");
      if(navbar && navbar instanceof HTMLDivElement) {
        navbar.style.position="";
      }
    }

    //----------------------
    //----------------------

    if (previouslyActiveEV && previouslyActiveEV !== newActiveviewEV) {
      if (previouslyActiveEV.leaf !== leaf) {
        //if loading new view to same leaf then don't save. Excalidarw view will take care of saving anyway.
        //avoid double saving
        if(previouslyActiveEV?.isDirty() && !previouslyActiveEV.semaphores?.viewunload) {
          await previouslyActiveEV.save(true); //this will update transclusions in the drawing
        }
      }
      if (previouslyActiveEV.file) {
        this.triggerEmbedUpdates(previouslyActiveEV.file.path);
      }
    }

    if (
      newActiveviewEV &&
      (!previouslyActiveEV || previouslyActiveEV.leaf !== leaf)
    ) {
      //the user switched to a new leaf
      //timeout gives time to the view being exited to finish saving
      const f = newActiveviewEV.file;
      if (newActiveviewEV.file) {
        setTimeout(() => {
          //@ts-ignore
          if (!newActiveviewEV || !newActiveviewEV._loaded) {
            return;
          }
          if (newActiveviewEV.file?.path !== f?.path) {
            return;
          }
          if (newActiveviewEV.activeLoader) {
            return;
          }
          newActiveviewEV.loadSceneFiles();
        }, 2000);
      } //refresh embedded files
    }

    
    if ( //@ts-ignore
      newActiveviewEV && newActiveviewEV._loaded &&
      newActiveviewEV.isLoaded && newActiveviewEV.excalidrawAPI &&
      this.ea.onCanvasColorChangeHook
    ) {
      this.ea.onCanvasColorChangeHook(
        this.ea,
        newActiveviewEV,
        newActiveviewEV.excalidrawAPI.getAppState().viewBackgroundColor
      );
    }

    //https://github.com/zsviczian/obsidian-excalidraw-plugin/issues/300
    if (this.popScope) {
      this.popScope();
      this.popScope = null;
    }
    if (newActiveviewEV) {
      this.registerHotkeyOverrides();
    }
  }

  public registerHotkeyOverrides() {
    //this is repeated here because the same function is called when settings is closed after hotkeys have changed
    if (this.popScope) {
      this.popScope();
      this.popScope = null;
    }

    if(!this.activeExcalidrawView) {
      return;
    }

    const scope = this.app.keymap.getRootScope();
    // Register overrides from settings
    const overrideHandlers = this.settings.modifierKeyOverrides.map(override => {
      return scope.register(override.modifiers, override.key, () => true);
    });
    // Force handlers to the front of the list
    overrideHandlers.forEach(() => scope.keys.unshift(scope.keys.pop()));

    const handler_ctrlF = scope.register(["Mod"], "f", () => true);
    scope.keys.unshift(scope.keys.pop()); // Force our handler to the front of the list
    const overridSaveShortcut = (
      this.forceSaveCommand &&
      this.forceSaveCommand.hotkeys[0].key === "s" &&
      this.forceSaveCommand.hotkeys[0].modifiers.includes("Ctrl")
    )
    const saveHandler = overridSaveShortcut
     ? scope.register(["Ctrl"], "s", () => this.forceSaveActiveView(false))
     : undefined;
    if(saveHandler) {
      scope.keys.unshift(scope.keys.pop()); // Force our handler to the front of the list
    }
    this.popScope = () => {
      overrideHandlers.forEach(handler => scope.unregister(handler));
      scope.unregister(handler_ctrlF);
      Boolean(saveHandler) && scope.unregister(saveHandler);
    }
  }

  private popScope: Function = null;
  private registerEventListeners() {
    this.app.workspace.onLayoutReady(async () => {
      (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.registerEventListeners,`ExcalidrawPlugin.registerEventListeners > app.workspace.onLayoutReady`);
      const onPasteHandler = (
        evt: ClipboardEvent,
        editor: Editor,
        info: MarkdownView | MarkdownFileInfo
      ) => {
        if(evt.defaultPrevented) return
        const data = evt.clipboardData.getData("text/plain");
        if (!data) return;
        if (data.startsWith(`{"type":"excalidraw/clipboard"`)) {
          evt.preventDefault();
          try {
            const drawing = JSON.parse(data);
            const hasOneTextElement = drawing.elements.filter((el:ExcalidrawElement)=>el.type==="text").length === 1;
            if (!(hasOneTextElement || drawing.elements?.length === 1)) {
              return;
            }
            const element = hasOneTextElement
              ? drawing.elements.filter((el:ExcalidrawElement)=>el.type==="text")[0]
              : drawing.elements[0];
            if (element.type === "image") {
              const fileinfo = this.filesMaster.get(element.fileId);
              if(fileinfo && fileinfo.path) {
                let path = fileinfo.path;
                const sourceFile = info.file;
                const imageFile = this.app.vault.getAbstractFileByPath(path);
                if(sourceFile && imageFile && imageFile instanceof TFile) {
                  path = this.app.metadataCache.fileToLinktext(imageFile,sourceFile.path);
                }
                editorInsertText(editor, getLink(this, {path}));
              }
              return;
            }
            if (element.type === "text") {
              editorInsertText(editor, element.rawText);
              return;
            }
            if (element.link) {
              editorInsertText(editor, `${element.link}`);
              return;
            }
          } catch (e) {
          }
        }
      };
      this.registerEvent(this.app.workspace.on("editor-paste", (evt, editor,info) => onPasteHandler(evt, editor, info)));

      //watch filename change to rename .svg, .png; to sync to .md; to update links
      const renameEventHandler = async (
        file: TAbstractFile,
        oldPath: string,
      ) => {
        (process.env.NODE_ENV === 'development') && DEBUGGING && debug(renameEventHandler,`ExcalidrawPlugin.renameEventHandler`, file, oldPath);
        if (!(file instanceof TFile)) {
          return;
        }
        if (!this.isExcalidrawFile(file)) {
          return;
        }
        if (!this.settings.keepInSync) {
          return;
        }
        [EXPORT_TYPES, "excalidraw"].flat().forEach(async (ext: string) => {
          const oldIMGpath = getIMGFilename(oldPath, ext);
          const imgFile = app.vault.getAbstractFileByPath(
            normalizePath(oldIMGpath),
          );
          if (imgFile && imgFile instanceof TFile) {
            const newIMGpath = getIMGFilename(file.path, ext);
            await this.app.fileManager.renameFile(imgFile, newIMGpath);
          }
        });
      };
      this.registerEvent(this.app.vault.on("rename", (file,oldPath) => renameEventHandler(file,oldPath)));

      const modifyEventHandler = async (file: TFile) => {
        (process.env.NODE_ENV === 'development') && DEBUGGING && debug(modifyEventHandler,`ExcalidrawPlugin.modifyEventHandler`, file);
        const excalidrawViews = getExcalidrawViews(this.app);
        excalidrawViews.forEach(async (excalidrawView) => {
          if(excalidrawView.semaphores?.viewunload) {
            return;
          }
          if (
            excalidrawView.file &&
            (excalidrawView.file.path === file.path ||
              (file.extension === "excalidraw" &&
                `${file.path.substring(
                  0,
                  file.path.lastIndexOf(".excalidraw"),
                )}.md` === excalidrawView.file.path))
          ) {
            if(excalidrawView.semaphores?.preventReload) {
              excalidrawView.semaphores.preventReload = false;
              return;
            }
            //if the user hasn't touched the file for 5 minutes, don't synchronize, reload.
            //this is to avoid complex sync scenarios of multiple remote changes outside an active collaboration session
            if(excalidrawView.lastSaveTimestamp + 300000 < Date.now()) {
              excalidrawView.reload(true, excalidrawView.file);
              return;
            }           
            if(file.extension==="md") {
              if(excalidrawView.semaphores?.embeddableIsEditingSelf) return;
              const inData = new ExcalidrawData(this);
              const data = await this.app.vault.read(file);
              await inData.loadData(data,file,getTextMode(data));
              excalidrawView.synchronizeWithData(inData);
              inData.destroy();
              if(excalidrawView?.isDirty()) {
                if(excalidrawView.autosaveTimer && excalidrawView.autosaveFunction) {
                  clearTimeout(excalidrawView.autosaveTimer);
                }
                if(excalidrawView.autosaveFunction) {
                  excalidrawView.autosaveFunction();
                }
              }
            } else {
              excalidrawView.reload(true, excalidrawView.file);
            }
          }
        });
      };
      this.registerEvent(this.app.vault.on("modify", (file:TFile) => modifyEventHandler(file)));

      //watch file delete and delete corresponding .svg and .png
      const deleteEventHandler = async (file: TFile) => {
        (process.env.NODE_ENV === 'development') && DEBUGGING && debug(deleteEventHandler,`ExcalidrawPlugin.deleteEventHandler`, file);
        if (!(file instanceof TFile)) {
          return;
        }

        const isExcalidarwFile = this.excalidrawFiles.has(file);
        this.updateFileCache(file, undefined, true);
        if (!isExcalidarwFile) {
          return;
        }

        //close excalidraw view where this file is open
        const excalidrawViews = getExcalidrawViews(this.app);
        for (const excalidrawView of excalidrawViews) {
          if (excalidrawView.file.path === file.path) {
            await excalidrawView.leaf.setViewState({
              type: VIEW_TYPE_EXCALIDRAW,
              state: { file: null },
            });
          }
        }

        //delete PNG and SVG files as well
        if (this.settings.keepInSync) {
          window.setTimeout(() => {
            [EXPORT_TYPES, "excalidraw"].flat().forEach(async (ext: string) => {
              const imgPath = getIMGFilename(file.path, ext);
              const imgFile = this.app.vault.getAbstractFileByPath(
                normalizePath(imgPath),
              );
              if (imgFile && imgFile instanceof TFile) {
                await this.app.vault.delete(imgFile);
              }
            });
          }, 500);
        }
      };
      this.registerEvent(this.app.vault.on("delete", (file:TFile) => deleteEventHandler(file)));

      //save Excalidraw leaf and update embeds when switching to another leaf
      this.registerEvent(
        this.app.workspace.on(
          "active-leaf-change",
          (leaf: WorkspaceLeaf) => this.activeLeafChangeEventHandler(leaf),
        ),
      );

      this.addFileSaveTriggerEventHandlers();

      const metaCache: MetadataCache = this.app.metadataCache;
      //@ts-ignore
      metaCache.getCachedFiles().forEach((filename: string) => {
        const fm = metaCache.getCache(filename)?.frontmatter;
        if (
          (fm && typeof fm[FRONTMATTER_KEYS["plugin"].name] !== "undefined") ||
          filename.match(/\.excalidraw$/)
        ) {
          this.updateFileCache(
            this.app.vault.getAbstractFileByPath(filename) as TFile,
            fm,
          );
        }
      });
      this.registerEvent(
        metaCache.on("changed", (file, _, cache) =>
          this.updateFileCache(file, cache?.frontmatter),
        ),
      );
    });
  }

  //Save the drawing if the user clicks outside the canvas
  public addFileSaveTriggerEventHandlers() {
    //https://github.com/zsviczian/obsidian-excalidraw-plugin/issues/551
    const onClickEventSaveActiveDrawing = (e: PointerEvent) => {
      if (
        !this.activeExcalidrawView ||
        !this.activeExcalidrawView?.isDirty() ||
        //@ts-ignore
        e.target && (e.target.className === "excalidraw__canvas" ||
        //@ts-ignore
        getParentOfClass(e.target,"excalidraw-wrapper"))
      ) {
        return;
      }
      this.activeExcalidrawView.save();
    };
    this.app.workspace.containerEl.addEventListener("click", onClickEventSaveActiveDrawing)
    this.removeEventLisnters.push(() => {
      this.app.workspace.containerEl.removeEventListener("click", onClickEventSaveActiveDrawing)
    });

    const onFileMenuEventSaveActiveDrawing = () => {
      (process.env.NODE_ENV === 'development') && DEBUGGING && debug(onFileMenuEventSaveActiveDrawing,`ExcalidrawPlugin.onFileMenuEventSaveActiveDrawing`);
      if (
        !this.activeExcalidrawView ||
        !this.activeExcalidrawView?.isDirty()
      ) {
        return;
      }
      this.activeExcalidrawView.save();
    };
    this.registerEvent(
      this.app.workspace.on("file-menu", onFileMenuEventSaveActiveDrawing),
    );

    this.addModalContainerObserver();

    //when the user activates the sliding drawers on Obsidian Mobile
    const leftWorkspaceDrawer = document.querySelector(
      ".workspace-drawer.mod-left",
    );
    const rightWorkspaceDrawer = document.querySelector(
      ".workspace-drawer.mod-right",
    );
    if (leftWorkspaceDrawer || rightWorkspaceDrawer) {
      const action = async (m: MutationRecord[]) => {
        if (
          m[0].oldValue !== "display: none;" ||
          !this.activeExcalidrawView ||
          !this.activeExcalidrawView?.isDirty()
        ) {
          return;
        }
        this.activeExcalidrawView.save();
      };
      const options = {
        attributeOldValue: true,
        attributeFilter: ["style"],
      };

      if (leftWorkspaceDrawer) {
        this.workspaceDrawerLeftObserver = DEBUGGING
          ? new CustomMutationObserver(action, "slidingDrawerLeftObserver")
          : new MutationObserver(action);
        this.workspaceDrawerLeftObserver.observe(leftWorkspaceDrawer, options);
      }

      if (rightWorkspaceDrawer) {
        this.workspaceDrawerRightObserver = DEBUGGING
          ? new CustomMutationObserver(action, "slidingDrawerRightObserver")
          : new MutationObserver(action);
        this.workspaceDrawerRightObserver.observe(
          rightWorkspaceDrawer,
          options,
        );
      }
    }
  }

  private activeViewDoc: Document;
  private addModalContainerObserver() {
    if(!this.activeExcalidrawView) return;
    if(this.modalContainerObserver) {
      if(this.activeViewDoc === this.activeExcalidrawView.ownerDocument) {
        return;
      }
      this.removeModalContainerObserver();
    }
    //The user clicks settings, or "open another vault", or the command palette
    const modalContainerObserverFn: MutationCallback = async (m: MutationRecord[]) => {
      (process.env.NODE_ENV === 'development') && DEBUGGING && debug(modalContainerObserverFn,`ExcalidrawPlugin.modalContainerObserverFn`, m);
      if (
        (m.length !== 1) ||
        (m[0].type !== "childList") ||
        (m[0].addedNodes.length !== 1) ||
        (!this.activeExcalidrawView) ||
        this.activeExcalidrawView?.semaphores?.viewunload ||
        (!this.activeExcalidrawView?.isDirty())
      ) {
        return;
      }
      this.activeExcalidrawView.save();
    };

    this.modalContainerObserver = DEBUGGING
      ? new CustomMutationObserver(modalContainerObserverFn, "modalContainerObserver")
      : new MutationObserver(modalContainerObserverFn);
    this.activeViewDoc = this.activeExcalidrawView.ownerDocument;
    this.modalContainerObserver.observe(this.activeViewDoc.body, {
      childList: true,
    });    
  }

  private removeModalContainerObserver() {
    if(!this.modalContainerObserver) return;
    this.modalContainerObserver.disconnect();
    this.activeViewDoc = null;
    this.modalContainerObserver = null;
  }

  //managing my own list of Excalidraw files because in the onDelete event handler
  //the file object is already gone from metadataCache, thus I can't check if it was an Excalidraw file
  updateFileCache(
    file: TFile,
    frontmatter?: FrontMatterCache,
    deleted: boolean = false,
  ) {
    (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.updateFileCache,`ExcalidrawPlugin.updateFileCache`, file, frontmatter, deleted);
    if (frontmatter && typeof frontmatter[FRONTMATTER_KEYS["plugin"].name] !== "undefined") {
      this.excalidrawFiles.add(file);
      return;
    }
    if (!deleted && file.extension === "excalidraw") {
      this.excalidrawFiles.add(file);
      return;
    }
    this.excalidrawFiles.delete(file);
  }

  onunload() {
    const excalidrawViews = getExcalidrawViews(this.app);
    excalidrawViews.forEach(({leaf}) => {
      this.setMarkdownView(leaf);
    });
    
    if(versionUpdateCheckTimer) {
      window.clearTimeout(versionUpdateCheckTimer);
    }

    if(this.ribbonIcon) {
      this.ribbonIcon.remove();
      this.ribbonIcon = null;
    }

    if(this.scriptEngine) {
      this.scriptEngine.destroy();
      this.scriptEngine = null;
    }

    if(imageCache) {
      imageCache.destroy();
    }

    this.stylesManager.destroy();
    this.stylesManager = null;

    this.removeFonts();
    this.removeEventLisnters.forEach((removeEventListener) =>
      removeEventListener(),
    );
    this.removeEventLisnters = [];

    this.eaInstances.forEach((ea) => ea?.destroy());
    this.eaInstances.clear();
    this.eaInstances = null;

    this.ea.destroy();
    this.ea = null;
    
    window.ExcalidrawAutomate?.destroy();
    delete window.ExcalidrawAutomate;
  
    if (this.popScope) {
      this.popScope();
      this.popScope = null;
    }
    if(this.legacyExcalidrawPopoverObserver) {
      this.legacyExcalidrawPopoverObserver.disconnect();
    }
    this.removeThemeObserver();
    this.removeModalContainerObserver();
    if (this.workspaceDrawerLeftObserver) {
      this.workspaceDrawerLeftObserver.disconnect();
    }
    if (this.workspaceDrawerRightObserver) {
      this.workspaceDrawerRightObserver.disconnect();
    }
    if (this.fileExplorerObserver) {
      this.fileExplorerObserver.disconnect();
    }
    if (this.taskbone) {
      this.taskbone.destroy();
      this.taskbone = null;
    }
    Object.values(this.packageMap).forEach((p:Packages)=>{
      delete p.excalidrawLib;
      delete p.reactDOM;
      delete p.react;
    });

    this.excalidrawConfig = null;

    this.openDialog.destroy();
    this.openDialog = null;

    this.insertLinkDialog.destroy();
    this.insertLinkDialog = null;

    this.insertCommandDialog.destroy();
    this.insertCommandDialog = null;

    this.importSVGDialog.destroy();
    this.importSVGDialog = null;

    this.insertImageDialog.destroy();
    this.insertImageDialog = null;

    this.insertMDDialog.destroy();
    this.insertMDDialog = null;

    this.forceSaveCommand = null;

    this.editorHandler.destroy();
    this.editorHandler = null;

    this.hover = {linkText: null, sourcePath:null};

    this.excalidrawFiles.clear();
    this.equationsMaster.clear();
    this.filesMaster.clear();
    this.mermaidsMaster.clear();

    this.activeExcalidrawView = null;
    this.lastActiveExcalidrawFilePath = null;

    if(this.leafChangeTimeout) {
      window.clearTimeout(this.leafChangeTimeout);
      this.leafChangeTimeout = null;
    }

    this.settings = null;
    clearMathJaxVariables();
    EXCALIDRAW_PACKAGES = "";
    //pluginPackages = null;
    PLUGIN_VERSION = null;
    //@ts-ignore
    delete window.PolyBool;
    this.deletePackage(window);
    react = null;
    reactDOM = null;
    excalidrawLib = null;
    terminateCompressionWorker();
  }

  public async embedDrawing(file: TFile) {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView && activeView.file) {
      const excalidrawRelativePath = this.app.metadataCache.fileToLinktext(
        file,
        activeView.file.path,
        this.settings.embedType === "excalidraw",
      );
      const editor = activeView.editor;

      //embed Excalidraw
      if (this.settings.embedType === "excalidraw") {
        editor.replaceSelection(
          getLink(this, {path: excalidrawRelativePath}),
        );
        editor.focus();
        return;
      }

      //embed image
      let theme = this.settings.autoExportLightAndDark
        ? getExportTheme (
          this,
          file,
          this.settings.exportWithTheme
            ? isObsidianThemeDark() ? "dark":"light"
            : "light"
          )
        : "";

      theme = (theme === "")
       ? ""
       : theme + ".";

      const imageRelativePath = getIMGFilename(
        excalidrawRelativePath,
        theme+this.settings.embedType.toLowerCase(),
      );
      const imageFullpath = getIMGFilename(
        file.path,
        theme+this.settings.embedType.toLowerCase(),
      );
     
      //will hold incorrect value if theme==="", however in that case it won't be used
      const otherTheme = theme === "dark." ? "light." : "dark.";
      const otherImageRelativePath = theme === "" 
        ? null
        : getIMGFilename(
            excalidrawRelativePath,
            otherTheme+this.settings.embedType.toLowerCase(),
          );

      const imgFile = this.app.vault.getAbstractFileByPath(imageFullpath);
      if (!imgFile) {
        await this.app.vault.create(imageFullpath, "");
        await sleep(200); //wait for metadata cache to update
      }

      const inclCom = this.settings.embedMarkdownCommentLinks;

      editor.replaceSelection(
        this.settings.embedWikiLink
          ? `![[${imageRelativePath}]]\n` +
            (inclCom
              ? `%%[[${excalidrawRelativePath}|🖋 Edit in Excalidraw]]${
                otherImageRelativePath
                  ? ", and the [["+otherImageRelativePath+"|"+otherTheme.split(".")[0]+" exported image]]"
                  : ""
                }%%`
              : "")
          : `![](${encodeURI(imageRelativePath)})\n` + 
            (inclCom ? `%%[🖋 Edit in Excalidraw](${encodeURI(excalidrawRelativePath,
              )})${otherImageRelativePath?", and the ["+otherTheme.split(".")[0]+" exported image]("+encodeURI(otherImageRelativePath)+")":""}%%` : ""),
      );
      editor.focus();
    }
  }

  public async loadSettings(opts: {
    applyLefthandedMode?: boolean,
    reEnableAutosave?: boolean
  } = {applyLefthandedMode: true, reEnableAutosave: false}
  ) {
    (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.loadSettings,`ExcalidrawPlugin.loadSettings`, opts);
    if(typeof opts.applyLefthandedMode === "undefined") opts.applyLefthandedMode = true;
    if(typeof opts.reEnableAutosave === "undefined") opts.reEnableAutosave = false;
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    if(!this.settings.previewImageType) { //migration 1.9.13
      if(typeof this.settings.displaySVGInPreview === "undefined") {
        this.settings.previewImageType = PreviewImageType.SVGIMG;
      } else {
        this.settings.previewImageType = this.settings.displaySVGInPreview
          ? PreviewImageType.SVGIMG
          : PreviewImageType.PNG; 
      }
    }
    if(opts.applyLefthandedMode) setLeftHandedMode(this.settings.isLeftHanded);
    if(opts.reEnableAutosave) this.settings.autosave = true;
    setDebugging(this.settings.isDebugMode);
  }

  async saveSettings() {
    (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.saveSettings,`ExcalidrawPlugin.saveSettings`);
    await this.saveData(this.settings);
  }

  public getStencilLibrary(): {} {
    (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.getStencilLibrary,`ExcalidrawPlugin.getStencilLibrary`);
    if (
      this.settings.library === "" ||
      this.settings.library === "deprecated"
    ) {
      return this.settings.library2;
    }
    return JSON_parse(this.settings.library);
  }

  public setStencilLibrary(library: {}) {
    (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.setStencilLibrary,`ExcalidrawPlugin.setStencilLibrary`, library);
    this.settings.library = "deprecated";
    this.settings.library2 = library;
  }

  public triggerEmbedUpdates(filepath?: string) {
    (process.env.NODE_ENV === 'development') && DEBUGGING && debug(this.triggerEmbedUpdates,`ExcalidrawPlugin.triggerEmbedUpdates`, filepath);
    const visitedDocs = new Set<Document>();
    this.app.workspace.getLeavesOfType("markdown").forEach((leaf) => {
//    this.app.workspace.iterateAllLeaves((leaf)=>{
      const ownerDocument = DEVICE.isMobile?document:leaf.view.containerEl.ownerDocument;
      if(!ownerDocument) return;
      if(visitedDocs.has(ownerDocument)) return;
      visitedDocs.add(ownerDocument);
      const e = ownerDocument.createEvent("Event");
      e.initEvent(RERENDER_EVENT, true, false);
      ownerDocument
        .querySelectorAll(
          `.excalidraw-embedded-img${
            filepath ? `[fileSource='${filepath.replaceAll("'", "\\'")}']` : ""
          }`,
        )
        .forEach((el) => el.dispatchEvent(e));  
    })
  }

  public openDrawing(
    drawingFile: TFile,
    location: PaneTarget,
    active: boolean = false,
    subpath?: string,
    justCreated: boolean = false,
    popoutLocation?: {x?: number, y?: number, width?: number, height?: number},
  ) {

    const fnGetLeaf = ():WorkspaceLeaf => {
      if(location === "md-properties") {
        location = "new-tab";
      }
      let leaf: WorkspaceLeaf;
      if(location === "popout-window") {
        //@ts-ignore (the api does not include x,y)
        leaf = this.app.workspace.openPopoutLeaf(popoutLocation);
      }
      if(location === "new-tab") {
        leaf = this.app.workspace.getLeaf('tab');
      }
      if(!leaf) {
        leaf = this.app.workspace.getLeaf(false);
        if ((leaf.view.getViewType() !== 'empty') && (location === "new-pane")) {
          leaf = getNewOrAdjacentLeaf(this, leaf)    
        }
      }
      return leaf;
    }

    const {leaf, promise} = openLeaf({
      plugin: this,
      fnGetLeaf: () => fnGetLeaf(),
      file: drawingFile,
      openState:!subpath || subpath === "" 
        ? {active}
        : { active, eState: { subpath } }
    });

    promise.then(()=>{
      if(justCreated && this.ea.onFileCreateHook) {
        try {
          this.ea.onFileCreateHook({
            ea: this.ea,
            excalidrawFile: drawingFile,
            view: leaf.view as ExcalidrawView,
          });
        } catch(e) {
          console.error(e);
        }
      }
    })
  }

  public async getBlankDrawing(): Promise<string> {
    const templates = getListOfTemplateFiles(this);
    if(templates) {
      const template = await templatePromt(templates, this.app);
      if (template && template instanceof TFile) {
        if (
          (template.extension == "md" && !this.settings.compatibilityMode) ||
          (template.extension == "excalidraw" && this.settings.compatibilityMode)
        ) {
          const data = await this.app.vault.read(template);
          if (data) {
            return this.settings.matchTheme
              ? changeThemeOfExcalidrawMD(data)
              : data;
          }
        }
      }
    }
    if (this.settings.compatibilityMode) {
      return this.settings.matchTheme && isObsidianThemeDark()
        ? DARK_BLANK_DRAWING
        : BLANK_DRAWING;
    }
    const blank =
      this.settings.matchTheme && isObsidianThemeDark()
        ? DARK_BLANK_DRAWING
        : BLANK_DRAWING;
    return `${FRONTMATTER}\n${getMarkdownDrawingSection(
      blank,
      this.settings.compress,
    )}`;
  }

  /**
   * Extracts the text elements from an Excalidraw scene into a string of ids as headers followed by the text contents
   * @param {string} data - Excalidraw scene JSON string
   * @returns {string} - Text starting with the "# Text Elements" header and followed by each "## id-value" and text
   */
  public async exportSceneToMD(data: string, compressOverride?: boolean): Promise<string> {
    if (!data) {
      return "";
    }
    const excalidrawData = JSON_parse(data);
    const textElements = excalidrawData.elements?.filter(
      (el: any) => el.type == "text",
    );
    let outString = `# Excalidraw Data\n## Text Elements\n`;
    let id: string;
    for (const te of textElements) {
      id = te.id;
      //replacing Excalidraw text IDs with my own, because default IDs may contain
      //characters not recognized by Obsidian block references
      //also Excalidraw IDs are inconveniently long
      if (te.id.length > 8) {
        id = nanoid();
        data = data.replaceAll(te.id, id); //brute force approach to replace all occurrences.
      }
      outString += `${te.originalText ?? te.text} ^${id}\n\n`;
    }
    return (
      outString +
      getMarkdownDrawingSection(
        JSON.stringify(JSON_parse(data), null, "\t"),
        typeof compressOverride === "undefined"
        ? this.settings.compress
        : compressOverride,
      )
    );
  }

  public async createDrawing(
    filename: string,
    foldername?: string,
    initData?: string,
  ): Promise<TFile> {
    const folderpath = normalizePath(
      foldername ? foldername : this.settings.folder,
    );
    await checkAndCreateFolder(folderpath); //create folder if it does not exist
    const fname = getNewUniqueFilepath(this.app.vault, filename, folderpath);
    const file = await this.app.vault.create(
      fname,
      initData ?? (await this.getBlankDrawing()),
    );
    
    //wait for metadata cache
    let counter = 0;
    while(file instanceof TFile && !this.isExcalidrawFile(file) && counter++<10) {
      await sleep(50);
    }
    
    if(counter > 10) {
      errorlog({file, error: "new drawing not recognized as an excalidraw file", fn: this.createDrawing});
    }

    if(Date.now() - this.loadTimestamp > 1){//2000) {     
      const filecount = this.app.vault.getFiles().filter(f=>this.isExcalidrawFile(f)).length;
      const rank:Rank = filecount < 200 ? "Bronze" : filecount < 750 ? "Silver" : filecount < 2000 ? "Gold" : "Platinum";
      const {grip, decoration, blade} = SwordColors[rank];
      if(this.settings.rank !== rank) {
        //in case the message was already displayed on another device and it was synced in the mean time
        await this.loadSettings();
        if(this.settings.rank !== rank) {
          this.settings.rank = rank;
          await this.saveSettings();
          new RankMessage(this.app, this, filecount, rank, decoration, blade, grip).open();
        }
      }
    }

    return file;
  }

  public async createAndOpenDrawing(
    filename: string,
    location: PaneTarget,
    foldername?: string,
    initData?: string,
  ): Promise<string> {
    const file = await this.createDrawing(filename, foldername, initData);
    this.openDrawing(file, location, true, undefined, true);
    return file.path;
  }

  public async setMarkdownView(leaf: WorkspaceLeaf, eState?: any) {
    const state = leaf.view.getState();

    //Note v2.0.19: I have absolutely no idea why I thought this is necessary. Removing this.
    //This was added in 1.4.2 but there is no hint in Release notes why.
    /*await leaf.setViewState({
      type: VIEW_TYPE_EXCALIDRAW,
      state: { file: null },
    });*/

    await leaf.setViewState(
      {
        type: "markdown",
        state,
        popstate: true,
      } as ViewState,
      eState ? eState : { focus: true },
    );

    const mdView = leaf.view;
    if(mdView instanceof MarkdownView) {
      foldExcalidrawSection(mdView);
    }

  }



  public isExcalidrawFile(f: TFile) {
    if(!f) return false;
    if (f.extension === "excalidraw") {
      return true;
    }
    const fileCache = f ? this.app.metadataCache.getFileCache(f) : null;
    return !!fileCache?.frontmatter && !!fileCache.frontmatter[FRONTMATTER_KEYS["plugin"].name];
  }

  public async exportLibrary() {
    if (DEVICE.isMobile) {
      const prompt = new Prompt(
        this.app,
        "Please provide a filename",
        "my-library",
        "filename, leave blank to cancel action",
      );
      prompt.openAndGetValue(async (filename: string) => {
        if (!filename) {
          return;
        }
        filename = `${filename}.excalidrawlib`;
        const folderpath = normalizePath(this.settings.folder);
        await checkAndCreateFolder(folderpath); //create folder if it does not exist
        const fname = getNewUniqueFilepath(
          this.app.vault,
          filename,
          folderpath,
        );
        this.app.vault.create(fname, this.settings.library);
        new Notice(`Exported library to ${fname}`, 6000);
      });
      return;
    }
    download(
      "data:text/plain;charset=utf-8",
      encodeURIComponent(JSON.stringify(this.settings.library2, null, "\t")),
      "my-obsidian-library.excalidrawlib",
    );
  }
}
