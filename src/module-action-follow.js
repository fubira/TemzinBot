const delay = require('delay');
const Vec3 = require('vec3').Vec3;

module.exports = function(bot) {
  // ロックして追いかける対象target
  var target_entity = undefined;

  function getTargetEntity() {
    return target_entity;
  }
  function setTargetEntity(entity = undefined) {
    if (target_entity !== entity) {
      target_entity = entity;
    }
  }
  
  // 追いかけないが注目する対象 interest
  var interest_entity = undefined;

  function getInterestEntity() {
    return interest_entity;
  }
  function setInterestEntity(entity = undefined) {
    if (interest_entity !== entity) {
      interest_entity = entity;
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

        if (dt < 0.3) {
          // 近接距離で顔を見て殴られたら追いかける対象として認識する
          bot.log('[bot.entitySwingArm] ' + entity.username + ' hit me!');
          setTargetEntity((getTargetEntity() !== entity) ? entity : undefined);
        }
      }
    }
  });

  bot.on('entityMoved', (entity) => {
    var distance = bot.entity.position.distanceTo(entity.position);
    
    // 至近距離にエンティティがいる場合少し動く
    if (distance < 0.8) {
      var botpos = bot.entity.position.clone();
      var entpos = entity.position.clone();
      botpos.y = entpos.y = 0;
      botpos.subtract(entpos);
      bot.entity.velocity.add(botpos.scaled(60));
    }
    
    
    if (distance < 3) {
      if (!getInterestEntity()) {
        // 注目している人がいないなら注目
        setInterestEntity(entity);
      } else {
        // 既に注目している人が居る場合、その人よりも近ければ注目を切り替える
        if (bot.entity.position.distanceTo(getInterestEntity().position) > distance)
          setInterestEntity(entity);
      }
    }

    if (distance > 6) {
      // 注目している人が一定以上離れたら注目解除
      if (getInterestEntity() === entity)
        setInterestEntity();
    }
  });

  setInterval(() => {
    var target = getTargetEntity();
    var interest = getInterestEntity();
    
    if (target) {
      var pos = bot.entity.position.clone();
      pos.subtract(target.position);
      var rot = Vec3ToRot(pos);

      if (Math.abs(rot.yaw - bot.entity.yaw) > 0.05 || Math.abs(rot.pitch - bot.entity.pitch) > 0.05) {
        bot.look(rot.yaw, rot.pitch, false, false);
      }

      // TODO: BehaviourTreeで実装したい
      var dist = bot.entity.position.distanceTo(target.position);
      if(dist > 3) {
        // bot.navigate.to(target.position);
        bot.setControlState("forward", true);
      } else {
        // bot.navigate.stop();
        bot.setControlState("forward", false);
      }

      if (target.metadata['0'] === 2) {
        bot.setControlState("sneak", true);
      } else {
        bot.setControlState("sneak", false);
      }
    }
    else if (interest) {
      var pos = bot.entity.position.clone();
      pos.subtract(interest.position);
      var rot = Vec3ToRot(pos);

      if (Math.abs(rot.yaw - bot.entity.yaw) > 0.05 || Math.abs(rot.pitch - bot.entity.pitch) > 0.05) {
        bot.look(rot.yaw, rot.pitch, false, false);
      }

      bot.setControlState("forward", false);
      
      if (interest.metadata['0'] === 2) {
        bot.setControlState('sneak', true);
      } else {
        // bot.setControlState('sneak', false);

        // 注目先が自分よりも下の位置にいたらしゃがむ
        bot.setControlState("sneak", (bot.entity.position.y - interest.position.y > 0.1 ));
      }
    }
     
    {
      // bot.clearControlStates();
    }
  }, 200);
}
