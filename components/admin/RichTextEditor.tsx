"use client";

import { useEffect, useRef, useState } from "react";

const BUTTON = "rounded-sm border border-black/15 px-2 py-1 text-xs hover:bg-black/5";

/**
 * Editor mínimo sin dependencias: contentEditable + document.execCommand.
 * Alcanza para negrita/itálica/listas/links en las notas del blog sin sumar
 * una librería de terceros. Guarda HTML en un input hidden con el `name` dado.
 *
 * El contenido inicial se pone una sola vez, imperativamente, en un useEffect
 * que corre solo al montar — el div contentEditable NUNCA recibe
 * `dangerouslySetInnerHTML` en el JSX. Esto no es cosmético: si el div
 * declarara su HTML por prop, cualquier re-render de este componente (el
 * propio, por ejemplo al sincronizar el input hidden) hace que React
 * reaplique ese HTML y borre lo que el usuario ya tipeó, aunque el string
 * de la prop no haya cambiado entre renders — se comprobó así en este
 * proyecto (React 19): un solo re-render alcanza para vaciar el recuadro,
 * no hace falta que se dispare en cada tecla. Al no declarar el HTML en el
 * JSX, React no vuelve a tocar el contenido del nodo nunca más después del
 * montaje, así que re-renderizar (por escribir, por subir una foto en el
 * formulario padre, etc.) ya no puede pisarlo.
 *
 * El input hidden sigue usando `value` controlado por estado (no
 * `defaultValue` + mutación imperativa) para no perder lo escrito si el
 * formulario padre se re-renderiza por otro motivo (ej. subir una foto).
 */
export default function RichTextEditor(props: { name: string; defaultValue?: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(props.defaultValue ?? "");

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = props.defaultValue || "<br>";
    }
    // Solo al montar: a partir de acá el contenido lo maneja el DOM directamente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    sync();
  }

  function sync() {
    if (!editorRef.current) return;
    const value = editorRef.current.innerHTML;
    setHtml(value === "<br>" ? "" : value);
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
      />
      <input type="hidden" name={props.name} value={html} readOnly />
    </div>
  );
}
