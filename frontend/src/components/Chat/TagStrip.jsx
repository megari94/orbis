import { useState } from 'react';

const DEFAULT_TAGS = ['precio', 'mayorista'];

export default function TagStrip() {
  const [tags, setTags] = useState(DEFAULT_TAGS);

  const removeTag = (tag) => setTags(t => t.filter(x => x !== tag));

  return (
    <div className="tag-strip">
      {tags.map(tag => (
        <span key={tag} className="tag-pill" onClick={() => removeTag(tag)}>
          <i className="fa-solid fa-tag" style={{ marginRight: 4, fontSize: 10 }} />
          {tag}
        </span>
      ))}
      <span className="tag-pill dashed">
        <i className="fa-solid fa-plus" style={{ marginRight: 4, fontSize: 10 }} />
        agregar etiqueta
      </span>
    </div>
  );
}
