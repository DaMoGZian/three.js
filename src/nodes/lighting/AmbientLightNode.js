import { registerNodeClass } from '../core/Node.js';
import AnalyticLightNode from './AnalyticLightNode.js';

class AmbientLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

	}

	setup( { context } ) {

		context.irradiance.addAssign( this.colorNode );

	}

}

export default AmbientLightNode;

registerNodeClass( 'AmbientLight', AmbientLightNode );
