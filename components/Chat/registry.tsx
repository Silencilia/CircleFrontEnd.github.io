import React from 'react';
import NameConfirm from '../Dialogs/NameConfirm';
import { ComponentKind } from '../../types/chat';

type Renderer = (props: any) => React.ReactNode;

const renderers: Record<ComponentKind, Renderer> = {
  NameConfirm: (props) => <NameConfirm {...props} />,
  NoteCard: (props) => <div className="bg-white border rounded p-3">NoteCard placeholder</div>,
  ContactCard: (props) => <div className="bg-white border rounded p-3">ContactCard placeholder</div>,
};

export function renderComponent(kind: ComponentKind, props: any) {
  const renderer = renderers[kind];
  if (!renderer) return null;
  return renderer(props);
}



