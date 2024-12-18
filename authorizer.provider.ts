"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthorizerProviders = void 0;
const auth_1 = require("../auth");
const decorators_1 = require("../decorators");
const core_1 = require("@nestjs/core"); // Ajout de l'import pour ModuleRef
function createServiceProvider(DTOClass) {
    const token = (0, auth_1.getAuthorizerToken)(DTOClass);
    const authorizer = (0, decorators_1.getAuthorizer)(DTOClass);

    if (!authorizer) {
        // Utilisation explicite de ModuleRef via useFactory
        return {
            provide: token,
            inject: [core_1.ModuleRef],
            useFactory: (moduleRef) => {
                const DefaultAuthorizer = (0, auth_1.createDefaultAuthorizer)(DTOClass, { authorize: () => ({}) });
                return new DefaultAuthorizer(moduleRef);
            },
        };
    }
    return { provide: token, useClass: authorizer };
}
function createCustomAuthorizerProvider(DTOClass) {
    const token = (0, auth_1.getCustomAuthorizerToken)(DTOClass);
    const customAuthorizer = (0, decorators_1.getCustomAuthorizer)(DTOClass);
    if (customAuthorizer) {
        return { provide: token, useClass: customAuthorizer };
    }
    return undefined;
}
const createAuthorizerProviders = (DTOClasses) => DTOClasses.reduce((providers, DTOClass) => {
    const p = createCustomAuthorizerProvider(DTOClass);
    if (p)
        providers.push(p);
    providers.push(createServiceProvider(DTOClass));
    return providers;
}, []);
exports.createAuthorizerProviders = createAuthorizerProviders;
//# sourceMappingURL=authorizer.provider.js.map
