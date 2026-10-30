import { test as check } from '@playwright/test'; const another = check; check('loads the page', () => {}); another('loads the page', () => {}); framework.test('loads the page', () => {});
