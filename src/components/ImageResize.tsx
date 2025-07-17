import { NodeViewWrapper, NodeViewProps, ReactNodeViewRenderer } from '@tiptap/react';
import { Resizable } from 're-resizable';
import { useCallback } from 'react';

const ImageResizeView = (props: NodeViewProps) => {
  const { editor, node, updateAttributes } = props;
  const { src, alt, title } = node.attrs;

  const onResizeStop = useCallback(
    (e: any, direction: any, ref: HTMLElement) => {
      updateAttributes({
        width: ref.style.width,
        height: ref.style.height,
      });
    },
    [updateAttributes]
  );

  return (
    <NodeViewWrapper className="image-re-size">
      <Resizable
        className="flex justify-center border-2 border-transparent hover:border-blue-500"
        defaultSize={{
          width: node.attrs.width || '100%',
          height: node.attrs.height || 'auto',
        }}
        onResizeStop={onResizeStop}
        lockAspectRatio
      >
        <img src={src} alt={alt} title={title} className="w-full h-full" />
      </Resizable>
    </NodeViewWrapper>
  );
};

export default ImageResizeView; 