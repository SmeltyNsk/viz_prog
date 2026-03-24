import { useEffect, useMemo, useState } from 'react';

export type BookApiItem = {
  id: number;
  title: string;
  isbn: string;
  pageCount: number;
  authors: string[];
};

export type BookCardProps = {
  title: string;
  authors: string[];
  coverBytes: Uint8Array;
  coverMimeType?: string;
};

export type BookViewModel = {
  id: number;
  title: string;
  authors: string[];
  coverBytes: Uint8Array;
  coverMimeType: string;
};

const BOOKS_API_URL = '/lab7-api/books';
const OPEN_LIBRARY_COVER_API = '/openlibrary-covers/b/isbn';
const MAX_BOOKS_TO_RENDER = 8;
const MAX_CONCURRENT_COVER_REQUESTS = 2;
const RETRY_ATTEMPTS = 3;

const FALLBACK_BOOKS: BookApiItem[] = [
  { id: 101, title: '1984', isbn: '9780451524935', pageCount: 328, authors: ['George Orwell'] },
  { id: 102, title: 'The Great Gatsby', isbn: '9780743273565', pageCount: 180, authors: ['F. Scott Fitzgerald'] },
  { id: 103, title: 'To Kill a Mockingbird', isbn: '9780061120084', pageCount: 336, authors: ['Harper Lee'] },
  { id: 104, title: 'Pride and Prejudice', isbn: '9780141439518', pageCount: 480, authors: ['Jane Austen'] },
  { id: 105, title: 'The Hobbit', isbn: '9780547928227', pageCount: 300, authors: ['J. R. R. Tolkien'] },
  { id: 106, title: 'Moby-Dick', isbn: '9780142437247', pageCount: 720, authors: ['Herman Melville'] },
  { id: 107, title: 'Brave New World', isbn: '9780060850524', pageCount: 288, authors: ['Aldous Huxley'] },
  { id: 108, title: 'Fahrenheit 451', isbn: '9781451673319', pageCount: 256, authors: ['Ray Bradbury'] },
];

function bytesToObjectUrl(bytes: Uint8Array, mimeType: string): string {
  const byteCopy = new Uint8Array(bytes.byteLength);
  byteCopy.set(bytes);
  const blob = new Blob([byteCopy], { type: mimeType });
  return URL.createObjectURL(blob);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelayMs(response: Response, attempt: number): number {
  const retryAfter = response.headers.get('retry-after');
  const retryAfterSeconds = retryAfter ? Number.parseInt(retryAfter, 10) : Number.NaN;
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return retryAfterSeconds * 1000;
  }
  return 600 * attempt;
}

async function fetchWithRetry(url: string, init?: RequestInit): Promise<Response> {
  let lastResponse: Response | null = null;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    const response = await fetch(url, init);
    if (response.status !== 429) {
      return response;
    }
    lastResponse = response;
    if (attempt < RETRY_ATTEMPTS) {
      const delay = getRetryDelayMs(response, attempt);
      await sleep(delay);
    }
  }
  return lastResponse ?? fetch(url, init);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      if (currentIndex >= items.length) return;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));
  return results;
}

async function fetchCoverBytesByIsbn(isbn: string): Promise<Uint8Array | null> {
  const coverUrl = `${OPEN_LIBRARY_COVER_API}/${encodeURIComponent(isbn)}-L.jpg?default=false`;
  const imgRes = await fetchWithRetry(coverUrl);
  if (!imgRes.ok) return null;

  const buffer = await imgRes.arrayBuffer();
  return new Uint8Array(buffer);
}

export function BookCard({ title, authors, coverBytes, coverMimeType = 'image/jpeg' }: BookCardProps) {
  const imageUrl = useMemo(() => bytesToObjectUrl(coverBytes, coverMimeType), [coverBytes, coverMimeType]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  return (
    <article className="book-card">
      <img className="book-cover" src={imageUrl} alt={`Обложка: ${title}`} />
      <h3 className="book-title">{title}</h3>
      <p className="book-authors">{authors.join(', ') || 'Unknown author'}</p>
    </article>
  );
}

export function BookGalleryDemo() {
  const [books, setBooks] = useState<BookViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBooks() {
      try {
        setLoading(true);
        setError(null);

        const booksRes = await fetchWithRetry(BOOKS_API_URL, {
          signal: controller.signal,
        });
        const booksJson = booksRes.ok ? ((await booksRes.json()) as BookApiItem[]) : FALLBACK_BOOKS;
        const firstBooks = booksJson.slice(0, MAX_BOOKS_TO_RENDER);

        const mapped = await mapWithConcurrency(
          firstBooks,
          async (book) => {
            const coverBytes = await fetchCoverBytesByIsbn(book.isbn);
            return coverBytes
              ? {
                  id: book.id,
                  title: book.title,
                  authors: book.authors,
                  coverBytes,
                  coverMimeType: 'image/jpeg',
                }
              : null;
          },
          MAX_CONCURRENT_COVER_REQUESTS
        );
        setBooks(mapped.filter((item): item is BookViewModel => item !== null));
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    void loadBooks();

    return () => controller.abort();
  }, []);

  if (loading) {
    return <p>Loading books...</p>;
  }

  if (error) {
    return (
      <div>
        <p role="alert">Failed to load books: {error}</p>
      </div>
    );
  }

  if (books.length === 0) {
    return <p role="alert">No books with available covers were found.</p>;
  }

  return (
    <section className="book-gallery">
      {books.map((book) => (
        <BookCard
          key={book.id}
          title={book.title}
          authors={book.authors}
          coverBytes={book.coverBytes}
          coverMimeType={book.coverMimeType}
        />
      ))}
    </section>
  );
}
