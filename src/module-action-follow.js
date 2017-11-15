const delay = require('delay');
const Vec3 = require('vec3').Vec3;

module.exports = function(bot) {
  var target_entity = undefined;      // ロックされたターゲットエンティティ
  var interest_entity = undefined;    // 興味を持っているエンティティ
  
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
    var groundDist = Math.sqrt(vec.x * vec.x + vec.z * vec.z);
    return Math.atan2(-vec.y, groundDist);
  }

  function Vec3ToYaw(vec) {
    var yaw;
    if (vec.x != 0.0) {
      yaw = Math.atan2(vec.x, vec.z)
    } else {
      yaw = (vec.z >= 0) ? Math.PI / 2 : -Math.PI / 2;
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
          target_entity = (entity !== target_entity) ? entity : undefined;
          bot.log('[bot.entitySwingArm] ' + target_entity);
        }
      }
    }
  });

  bot.on('entityMoved', (entity) => {
    var distance = bot.entity.position.distanceTo(entity.position);

    // 至近距離にエンティティがいる場合少し動く
    if (distance < 0.8) {
      var botpos = bot.entity.position;
      var entpos = entity.position;
      botpos.subtract(entpos);
      bot.entity.velocity.add(botpos.scaled(60));
    }
    
    // 注目中のエンティティへの対処
    if (interest_entity === entity) {
      // 一定よりも離れると注目をやめる
      if (distance > 2)
        interest_entity = undefined;
    } else {
      // interest_entityよりも近くに来たエンティティに興味を移す
      if (distance < 2) {
        if (!interest_entity || distance < bot.entity.position.distanceTo(interest_entity.position))
          interest_entity = entity;
      }
    }
  });

  setInterval(() => {
    if (target_entity) {
      bot.log('target: ' + target_entity.username);
      var dp = bot.entity.position.subtract(target_entity.position);
      var rot = Vec3ToRot(dp);

      if (Math.abs(rot.yaw - bot.entity.yaw) > 0.05 || Math.abs(rot.pitch - bot.entity.pitch) > 0.05) {
        bot.log('[look] target:' + target_entity.username);
        bot.look(rot.yaw, rot.pitch, false, false);
      }

      // TODO: BehaviourTreeで実装したい
      var dist = bot.entity.position.distanceTo(target_entity.position);
      if(dist > 2) {
        bot.clearControlStates();
        bot.setControlState("sneak", false);
        bot.setControlState("swing", false);
        bot.setControlState("forward", true);
        bot.setControlState("jump", false);
      } else {
        bot.clearControlStates();
        bot.setControlState("swing", true);
      }

      if (target_entity.metadata['0'] === 2) {
        bot.setControlState("sneak", true);
        delay(1000).then(()=> {
          bot.setControlState("sneak", false);
        })
      }
    } else if (interest_entity) {
      var dp = bot.entity.position.subtract(interest_entity.position);
      var rot = Vec3ToRot(dp);

      if (Math.abs(rot.yaw - bot.entity.yaw) > 0.05 || Math.abs(rot.pitch - bot.entity.pitch) > 0.05) {
        bot.log('[look] interest:' + interest_entity.username);
        bot.look(rot.yaw, 0, false, false);
      }

      if (interest_entity.metadata['0'] === 2) {
        bot.setControlState('sneak', true);
        delay(1000).then(()=> {
          bot.setControlState('sneak', false);
        })
      }
    } else {
      bot.clearControlStates();
    }
  }, 500);
}
