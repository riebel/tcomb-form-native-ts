import type { ListTemplateProps } from '../types/template.types';
declare const List: <T>({ items, onAdd, onRemove, renderItem: renderItemProp, addLabel, removeLabel, disabled, hidden, stylesheet, hasError, label, help, error, ...rest }: ListTemplateProps<T>) => import("react/jsx-runtime").JSX.Element | null;
export default List;
