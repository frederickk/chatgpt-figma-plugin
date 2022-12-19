/**
 * @fileoverview Elements within plugin UI panel.
 */

/** Button elements for trigginer actions. */
export const buttonElems: { [key: string]: HTMLButtonElement; } = {
  agree: document.querySelector('#agree')!,
  debug: document.querySelector('#debug')!,
  disagree: document.querySelector('#disagree')!,
  eval: document.querySelector('#execute')!,
  feelingLucky: document.querySelector('#feeling-lucky')!,
  lexica: document.querySelector('#find-lexica')!,
  wdyt: document.querySelector('#wdyt')!,
};

/** Container elements UI elements. */
export const containerElems: { [key: string]: HTMLElement; } = {
  disclaimer: document.querySelector('#disclaimer')!,
  konsole: document.querySelector('#konsole')!,
};

/** Detail expansion panels. */
export const detailsElems: { [key: string]: HTMLDetailsElement; } = {
  code: document.querySelector('#details__code')!,
  lexica: document.querySelector('#details__lexica')!,
  konsole: document.querySelector('#details__konsole')!,
};

/** Icon containers within button elements. */
export const iconElems: { [key: string]: HTMLSpanElement; } = {
  eval: buttonElems.eval.querySelector('.material-symbols-outlined')!,
  lexica: buttonElems.lexica.querySelector('.material-symbols-outlined')!,
  wdyt: buttonElems.wdyt.querySelector('.material-symbols-outlined')!,
};

/** Textarea and text Input elements. */
export const textareaElems: { [key: string]: HTMLTextAreaElement | HTMLInputElement; } = {
  eval: document.querySelector('#eval')!,
  lexica: document.querySelector('#lexica')!,
  prompt: document.querySelector('#prompt')!,
};