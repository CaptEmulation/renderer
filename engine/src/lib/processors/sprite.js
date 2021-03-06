/**
 * Created by vedi on 19/03/2017.
 */

import _ from 'lodash';
import { Sprite } from 'pixi.js';
import actionHelper from '../utils/actionHelper';

import container from './container';
import object from './object';


/**
 * @param params
 * @param params.payload
 * @param params.payload.key='sprite'
 * @param params.payload.width=100
 * @param params.payload.height=100
 * @param params.payload.color=0xffffff
 * @param params.payload.x
 * @param params.payload.y
 * @param params.payload.pivotX
 * @param params.payload.pivotY
 * @param params.payload.texture=objectTexture
 * @returns {*}
 */
export default (params) => {
    const {
        logger,
        rootContainer,
        scope,
        world: { app },
        objectMetadata: { texture: objectTexture },
        payload: {
            parentId,
            texture = objectTexture,
            ...payload
        } = {},
        stage: { resourceManager },
        ...otherParams
    } = params;

    if (!texture) {
        logger.warn('texture is not provided');
        return;
    }
    let resource;
    if (_.isString(texture)) {
        resource = resourceManager.getCachedResource(texture);
    } else {
        resource = texture;
        if (!resource) {
            logger.warn('Cannot find resource', texture);
            return;
        }
    }

    if (resource) {
        const obj = object(
            {
                logger,
                payload: { ...payload, parentId },
                rootContainer,
                scope,
                ...otherParams,
            },
            Sprite,
            [resource.texture]
        );
        actionHelper.setSvgResizeHandler(app, obj, resource);
        return obj;
    } else {
        // wrapping to container
        const result = container(
            {
                logger,
                payload: { parentId },
                rootContainer,
                scope,
                ...otherParams,
            }
        );
        resourceManager
            .getResource(texture)
            .then((loadedResource) => {
                const obj = object(
                    {
                        logger,
                        payload: { ...payload, addToParent: false },
                        rootContainer,
                        scope: {},
                        ...otherParams,
                    },
                    Sprite,
                    [loadedResource.texture]
                );
                actionHelper.setSvgResizeHandler(app, obj, loadedResource);
                obj.zIndex = -1000;
                result.addChild(obj);
            });
        return result;
    }
};
