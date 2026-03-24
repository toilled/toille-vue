interface ParagraphProps {
  paragraph: string;
  last: boolean;
}

export default function Paragraph(props: ParagraphProps) {
  return (
    <div
      class="text-paragraph"
      classList={{ marginless: props.last }}
      innerHTML={props.paragraph}
    ></div>
  );
}
