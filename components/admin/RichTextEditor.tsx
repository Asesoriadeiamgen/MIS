"use client";

import { useRef } from "react";

const BUTTON = "rounded-sm border border-black/15 px-2 py-1 text-xs hover:bg-black/5";

/**
 * Editor mínimo sin dependencias: contentEditable + document.execCommand.
 * Alcanza para negrita/itálica/listas/links en las notas del blog sin sumar
 * una librería de terceros. Guarda HTML en un input hidden con el `name` dado.
 */
export default function RichTextEditor(props: { name: string; defaultValue?: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    sync();
  }

  function sync() {
    if (hiddenRef.current && editorRef.current) {
      hiddenRef.current.value = editorRef.current.innerHTML;
    }
  }

  function handleLink() {
    const url = window.prompt("URL del link:");
    if (url) exec("createLink", url);
  }

  return (
    <div>
      <div className="mb-1 flex flex-wrap gap-1">
        <button type="button" className={BUTTON} onClick={() => exec("bold")}>
          <b>N</b>
        </button>
        <button type="button" className={BUTTON} onClick={() => exec("italic")}>
          <i>I</i>
        </button>
        <button type="button" className={BUTTON} onClick={() => exec("justifyLeft")} title="Alinear a la izquierda">
          ≡←
        </button>
        <button type="button" className={BUTTON} onClick={() => exec("justifyCenter")} title="Centrar">
          ≡○
        </button>
        <button type="button" className={BUTTON} onClick={() => exec("justifyRight")} title="Alinear a la derecha">
          ≡→
        </button>
        <button type="button" className={BUTTON} onClick={() => exec("justifyFull")} title="Justificar">
          ≡≡
        </button>
        <button type="button" className={BUTTON} onClick={() => exec("insertUnorderedList")}>
          Lista
        </button>
        <button type="button" className={BUTTON} onClick={() => exec("insertOrderedList")}>
          1. Lista
        </button>
        <button type="button" className={BUTTON} onClick={handleLink}>
          Link
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
        className="min-h-[200px] rounded-sm border border-black/15 bg-white px-3 py-2 text-sm focus:border-black/40 focus:outline-none [&_a]:underline [&_li]:ml-4 [&_ol]:list-decimal [&_ul]:list-disc"
        dangerouslySetInnerHTML={{ __html: props.defaultValue ?? "" }}
      />
      <input ref={hiddenRef} type="hidden" name={props.name} defaultValue={props.defaultValue ?? ""} />
    </div>
  );
}
