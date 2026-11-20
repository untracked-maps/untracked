import type { IConfiguration } from 'dependency-cruiser';
import { FORBIDDEN_CONFIGURATION } from '#dependency-cruiser/configuration';
import { FORBIDDEN_FEATURES } from '#dependency-cruiser/features';
import { FORBIDDEN_GLOBAL } from '#dependency-cruiser/global';
import { FORBIDDEN_LAYERS } from '#dependency-cruiser/layers';
import { FORBIDDEN_LIBRARIES } from '#dependency-cruiser/libraries';
import { FORBIDDEN_ROUTES } from '#dependency-cruiser/routes';
import { FORBIDDEN_TESTS } from '#dependency-cruiser/tests';
import { FORBIDDEN_UNREACHABLE } from '#dependency-cruiser/unreachable';

const config: IConfiguration = {
  forbidden: [
    ...FORBIDDEN_GLOBAL,
    ...FORBIDDEN_UNREACHABLE,
    ...FORBIDDEN_ROUTES,
    ...FORBIDDEN_FEATURES,
    ...FORBIDDEN_LAYERS,
    ...FORBIDDEN_CONFIGURATION,
    ...FORBIDDEN_LIBRARIES,
    ...FORBIDDEN_TESTS
  ],
  options: {
    doNotFollow: { path: ['node_modules', '^[.]paraglide/'] },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
      extensions: ['.ts', '.js', '.svelte']
    },
    skipAnalysisNotInRules: true,
    reporterOptions: {
      dot: { collapsePattern: 'node_modules/(?:@[^/]+/[^/]+|[^/]+)' },
      archi: {
        collapsePattern:
          '^src/features/[^/]+/abilities/[^/]+|^src/features/[^/]+|^src/[^/]+|node_modules/(?:@[^/]+/[^/]+|[^/]+)'
      }
    }
  }
};

export default config;
