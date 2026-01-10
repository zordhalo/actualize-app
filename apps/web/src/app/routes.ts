import { readdirSync, statSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	type RouteConfigEntry,
	index,
	route,
} from '@react-router/dev/routes';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Directories to exclude from route generation
const EXCLUDED_DIRS = new Set([
	'__create',
	'__tests__',
	'api',
	'components',
	'utils',
	'node_modules',
	'.git',
]);

type Tree = {
	path: string;
	children: Tree[];
	hasPage: boolean;
	isParam: boolean;
	paramName: string;
	isCatchAll: boolean;
};

function buildRouteTree(dir: string, basePath = '', visited = new Set<string>()): Tree {
	// Resolve symlinks and check for circular references
	let realDir: string;
	try {
		realDir = realpathSync(dir);
	} catch {
		realDir = dir;
	}
	
	// Skip if we've already visited this directory (circular reference protection)
	if (visited.has(realDir)) {
		return {
			path: basePath,
			children: [],
			hasPage: false,
			isParam: false,
			isCatchAll: false,
			paramName: '',
		};
	}
	visited.add(realDir);

	const files = readdirSync(dir);
	const node: Tree = {
		path: basePath,
		children: [],
		hasPage: false,
		isParam: false,
		isCatchAll: false,
		paramName: '',
	};

	// Check if the current directory name indicates a parameter
	const dirName = basePath.split('/').pop();
	if (dirName?.startsWith('[') && dirName.endsWith(']')) {
		node.isParam = true;
		const paramName = dirName.slice(1, -1);

		// Check if it's a catch-all parameter (e.g., [...ids])
		if (paramName.startsWith('...')) {
			node.isCatchAll = true;
			node.paramName = paramName.slice(3); // Remove the '...' prefix
		} else {
			node.paramName = paramName;
		}
	}

	for (const file of files) {
		// Skip excluded directories
		if (EXCLUDED_DIRS.has(file)) {
			continue;
		}
		
		const filePath = join(dir, file);
		const stat = statSync(filePath);

		if (stat.isDirectory()) {
			const childPath = basePath ? `${basePath}/${file}` : file;
			const childNode = buildRouteTree(filePath, childPath, visited);
			// Only add child nodes that have pages or have children with pages
			if (childNode.hasPage || childNode.children.length > 0) {
				node.children.push(childNode);
			}
		} else if (file === 'page.jsx') {
			node.hasPage = true;
		}
	}

	return node;
}

function generateRoutes(node: Tree): RouteConfigEntry[] {
	const routes: RouteConfigEntry[] = [];

	if (node.hasPage) {
		const componentPath =
			node.path === '' ? `./${node.path}page.jsx` : `./${node.path}/page.jsx`;

		if (node.path === '') {
			routes.push(index(componentPath));
		} else {
			// Handle parameter routes
			let routePath = node.path;

			// Replace all parameter segments in the path
			const segments = routePath.split('/');
			const processedSegments = segments.map((segment) => {
				if (segment.startsWith('[') && segment.endsWith(']')) {
					const paramName = segment.slice(1, -1);

					// Handle catch-all parameters (e.g., [...ids] becomes *)
					if (paramName.startsWith('...')) {
						return '*'; // React Router's catch-all syntax
					}
					// Handle optional parameters (e.g., [[id]] becomes :id?)
					if (paramName.startsWith('[') && paramName.endsWith(']')) {
						return `:${paramName.slice(1, -1)}?`;
					}
					// Handle regular parameters (e.g., [id] becomes :id)
					return `:${paramName}`;
				}
				return segment;
			});

			routePath = processedSegments.join('/');
			routes.push(route(routePath, componentPath));
		}
	}

	for (const child of node.children) {
		routes.push(...generateRoutes(child));
	}

	return routes;
}
if (import.meta.env.DEV) {
	import.meta.glob('./**/page.jsx', {});
	if (import.meta.hot) {
		import.meta.hot.accept((newSelf) => {
			import.meta.hot?.invalidate();
		});
	}
}

// Build route tree with a fresh visited set for each build
const tree = buildRouteTree(__dirname, '', new Set<string>());
const generatedRoutes = generateRoutes(tree);
const notFound = route('*', './__create/not-found.tsx');

// Combine routes - generated routes first, then catch-all
const routes: RouteConfigEntry[] = [...generatedRoutes, notFound];

export default routes;
