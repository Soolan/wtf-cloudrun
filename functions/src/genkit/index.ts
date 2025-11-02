import {onCallGenkit} from "firebase-functions/https";
import * as admin from "firebase-admin";
import {SECRET_AUTH_POLICY} from "./shared/config";
import {genImageFlow} from "./genImage/genImage.flow";
// import {genTopicFlow} from "./genTopic/genTopic.flow";
// import {genKbChunksFlow} from './genKbChunks/genKbChunks.flow';
// import {chatBpmnEligibilityFlow} from './chatBpmnEligibility/chatBpmnEligibility.flow';
// import {chatWithUserFlow} from "./chatWithUser/chatWithUser.flow";
// import {genBpmnFlow} from "./genBpmn/genBpmn.flow";
// import {clarifyToDoFlow} from "./kanban/clarifyToDo/clarifyToDo.flow";

if (!admin.apps.length) {
  admin.initializeApp();
}

export const generateImage: CallableFunction = onCallGenkit(SECRET_AUTH_POLICY, genImageFlow);
// export const generateTopic: CallableFunction = onCallGenkit(SECRET_AUTH_POLICY, genTopicFlow);
// export const generateKbChunks: CallableFunction = onCallGenkit(SECRET_AUTH_POLICY, genKbChunksFlow);
// export const chatBpmnEligibility: CallableFunction = onCallGenkit(SECRET_AUTH_POLICY, chatBpmnEligibilityFlow);
// export const chatWithUser: CallableFunction = onCallGenkit(SECRET_AUTH_POLICY, chatWithUserFlow);
// export const generateBpmn: CallableFunction = onCallGenkit(SECRET_AUTH_POLICY, genBpmnFlow);
// export const clarifyToDo: CallableFunction = onCallGenkit(SECRET_AUTH_POLICY, clarifyToDoFlow);


// Note: if you face some weired IAM issues during the deploy,
// simply replace onCallGenkit with onCall as follows:

// export const generateKbChunks = onCall(SECRET_AUTH_POLICY, async (req) => {
//   return await genKbChunksFlow(req.data);
// });
