"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthorizerProviders = void 0;
const auth_1 = require("../auth");
const decorators_1 = require("../decorators");
function createServiceProvider(DTOClass) {
    const token = (0, auth_1.getAuthorizerToken)(DTOClass);
    const authorizer = (0, decorators_1.getAuthorizer)(DTOClass);
    if (!authorizer) {
        // create default authorizer in case any relations have an authorizers
        return { provide: token, useClass: (0, auth_1.createDefaultAuthorizer)(DTOClass, { authorize: () => ({}) }) };
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
