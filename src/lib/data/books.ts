import booksData from './books.json';
import type { LibraryBook } from './library-types';

export const libraryBooks: LibraryBook[] = (booksData as { books: LibraryBook[] }).books;
