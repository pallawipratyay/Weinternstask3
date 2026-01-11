import { useEffect, useMemo } from "react";

export default function Preview({ html, css, js }) {
  const content = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${css || ""}</style>
      </head>
      <body>
        ${html || ""}
        <script>
          ${js || ""}
        <\/script>
      </body>
      </html>
    `;
  }, [html, css, js]);

  return (
    <div className="w-full h-full min-h-[600px]">
      <iframe
        srcDoc={content}
        className="w-full h-full border-0"
        sandbox="allow-scripts"
        title="Preview"
      />
    </div>
  );
}
