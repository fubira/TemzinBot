const delay = require('delay');
const Vec3 = require('vec3').Vec3;

module.exports = function(bot) {
  var follow_target = undefined;

  function RotToVec3(pitch, yaw, rad) {
    return new Vec3(-rad * Math.cos(pitch) * Math.sin(yaw),
                     rad * Math.sin(pitch),
                    -rad * Math.cos(pitch) * Math.cos(yaw));
  }

  function Vec3ToRot(vec) {
    return {
      'pitch': Vec3ToPitch(vec),
      'yaw': Vec3ToYaw(vec),
      'radius': vec.distanceTo(new Vec3(null))
    };
  }

  function Vec3ToPitch(vec) {
    var groundDist = Math.sqrt(v.x * v.x + v.z * v.z);
    return Math.atan2(-v.y, groundDist);
  }

  function Vec3ToYaw(vec) {
    var yaw;
    if (vec.x != 0.0) {
      yaw = Math.atan2(v.x, v.z)
    } else {
      yaw = (v.z >= 0) ? Math.PI / 2 : -Math.PI / 2;
    }
    return yaw;
  }

  bot.on('entitySwingArm', (entity) => {
    var distance = bot.entity.position.distanceTo(entity.position);

    if (entity.type === 'player') {
      if (distance < 4) {
        var lookat = RotToVec3(entity.pitch, entity.yaw, distance);
        var dt = bot.entity.position.distanceTo(lookat.add(entity.position));

        if (dt < 0.25) {
          // 近接距離で顔を見て殴られたら追いかける対象として認識する
          bot.log('[bot.entitySwingArm] ' + entity.username + ' hit me!');
          follow_target = (entity !== follow_target) ? follow_target : undefined;
        }
      }
    }
  });

  // 3秒に1回のインターバル処理
  setInterval(() => {
    if (follow_target) {
      var dp = bot.entity.position.subtract(follow_target.position);
      var rot = Vec3ToRot(dp);

      if (Math.abs(rot.yaw - bot.yaw) > 0.05 || Math.abs(rot.pitch - bot.pitch) > 0.05) {
        bot.log('[look] target:' + follow_target.username);
        bot.look(rot.yaw, 0, false, false);
      }

      // TODO: BehaviourTreeで実装したい
      var dist = bot.entity.position.distanceTo(follow_target.position);
      if(dist > 2) {
        bot.setControlState('sneak', false);
        bot.setControlState("swing", false);
        bot.setControlState('forward', true);
        bot.setControlState('jump', true);
      } else {
        bot.clearControlStates();
        bot.setControlState("swing", true);
      }
      if (follow_target.metadata['0'] === 2) {
        bot.setControlState('sneak', true);
        delay(500).then(()=> {
          bot.setControlState('sneak', false);
        })
      }
    } else {
      bot.clearControlStates();
    }
  }, 3000);
}
