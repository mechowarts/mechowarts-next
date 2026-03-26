export function Wrapper({
  className,
  ...props
}: React.ComponentProps<'div'> & { maxWidth?: string; padding?: string }) {
  return (
    <div
      className={`mx-auto w-full max-w-[min(var(--max-width,72rem),calc(100%-(var(--padding,4%)*2)))] ${typeof className === 'string' ? className : ''}`}
      style={{
        ...(props.maxWidth && { '--max-width': props.maxWidth }),
        ...(props.padding && { '--padding': props.padding }),
        ...props.style,
      }}
      {...props}
    />
  )
}
