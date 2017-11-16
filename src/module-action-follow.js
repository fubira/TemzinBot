const delay = require('delay');
const Vec3 = require('vec3').Vec3;

module.exports = function(bot) {
  var target_entity = undefined;      // ロックされたターゲットエンティティ
  var interest_entity = undefined;    // 興味を持っているエンティティ
  
  function getTarget() {
    return target_entity;
  }

  function setTarget(entity = undefined) {
    if (entity === undefined) {
      taget_entity = undefined;
      bot.log('[bot.setTarget] target cleared');
      return;
    }

    if (target_entity !== entity) {
      target_entity = entity;
      bot.log('[bot.setTarget] ' + entity.username);
    }
  }
  
  function getInterest() {
    return interest_entity;
  }

  function setInterest(entity = undefined) {
    if (entity === undefined) {
      interest_entity = undefined;
      bot.log('[bot.setInterest] interest cleared');
      return;
    }

    if (interest_entity !== entity) {
      interest_entity = entity;
      bot.log('[bot.setInterest] ' + entity.username);
    }
  }

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

        if (dt < 0.4) {
          // 近接距離で顔を見て殴られたら追いかける対象として認識する
          bot.log('[bot.entitySwingArm] ' + entity.username + ' hit me!');
          setTarget((getTarget() !== entity) ? entity : undefined);
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
    
    
    if (distance < 3) {
      if (!getInterest()) {
        // 注目している人がいないなら注目
        setInterest(entity);
      } else {
        // 既に注目している人が居る場合、その人よりも近ければ注目を切り替える
        if (bot.entity.position.distanceTo(getInterest().position) > distance)
          setInterest(entity);
      }
    }

    if (distance > 6) {
      // 注目している人が一定以上離れたら注目解除
      if (getInterest() === entity)
        setInterest();
    }
  });

  setInterval(() => {
    var target = getTarget();
    var interest = getInterest();
    
    if (target) {
      var rot = Vec3ToRot(bot.entity.position.subtract(target.position));

      if (Math.abs(rot.yaw - bot.entity.yaw) > 0.05 || Math.abs(rot.pitch - bot.entity.pitch) > 0.05) {
        bot.look(rot.yaw, rot.pitch, false, false);
      }

      // TODO: BehaviourTreeで実装したい
      var dist = bot.entity.position.distanceTo(target.position);
      if(dist > 2) {
        bot.setControlState("forward", true);
      } else {
        bot.setControlState("forward", false);
      }

      if (target.metadata['0'] === 2) {
        bot.setControlState("sneak", true);
      } else {
        bot.setControlState("sneak", false);
      }
    }

    if (interest) {
      var rot = Vec3ToRot(bot.entity.position.subtract(interest.position));

      if (Math.abs(rot.yaw - bot.entity.yaw) > 0.05 || Math.abs(rot.pitch - bot.entity.pitch) > 0.05) {
        bot.look(rot.yaw, rot.pitch, false, false);
      }

      if (interest.metadata['0'] === 2) {
        bot.setControlState('sneak', true);
      } else {
        bot.setControlState('sneak', false);
      }
    }
     
    {
      // bot.clearControlStates();
    }
  }, 100);
}
