type Document = {
  id: string;
  isPublished: boolean;
};

type SearchDocument = {
  id: string;
};

declare const documents: readonly Document[];
declare const toSearchDocument: (document: Document) => SearchDocument;

export const searchDocuments = documents.reduce<SearchDocument[]>(
  (matches, document) => {
    if (!document.isPublished) {
      return matches;
    }

    matches.push(toSearchDocument(document));

    return matches;
  },
  [],
);
