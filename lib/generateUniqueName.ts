import Document from "@/models/Document";

export async function generateUniqueName(baseName: string) {
  const existingDocs = await Document.find({
    name: { $regex: `^${baseName}( \\(\\d+\\))?$`, $options: "i" },
  });

  if (existingDocs.length === 0) {
    return baseName;
  }

  let counter = 1;
  let newName = `${baseName} (${counter})`;

  while (await Document.exists({ name: newName })) {
    counter++;
    newName = `${baseName} (${counter})`;
  }

  return newName;
}