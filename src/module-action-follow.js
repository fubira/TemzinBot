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
      if (interest_entity) {
        var name = interest_entity.name !== undefined ? interest_entity.name : interest_entity.username;
        var type = interest_entity.type;
        var kind = interest_entity.kind;
        bot.log('[bot.setInterestEntity] ' + bot.username + ' is interested in ' + name + ' (' + type + (kind !== undefined ) ? ':' + kind : '' + ')');
      }
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

  bot.on('playerCollect', (collector, collected) => {
    // 注目しているアイテムが誰かに拾われたら注目を解除する
    if (getInterestEntity() === collected) {
      setInterestEntity();

      // 拾ったのが自分以外なら拾った人を注目する
      if (collector !== bot.entity) {
        setInterestEntity(collector);      
      }
    }
  });

  bot.on('entityMoved', (entity) => {
    var distance = bot.entity.position.distanceTo(entity.position);

    // 至近距離にプレイヤーがいる場合少し動く
    if (entity.type === 'player'　&& distance < 0.8) {
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
    
    var entity;
    if (target) {
      entity = target;
    } else if (interest) {
      entity = interest;
    }

    if (entity)
    {
      var pos = bot.entity.position.clone();
      pos.subtract(entity.position);
      var rot = Vec3ToRot(pos);
  
      // 対象に向く
      if (Math.abs(rot.yaw - bot.entity.yaw) > 0.05 || Math.abs(rot.pitch - bot.entity.pitch) > 0.05) {
        bot.look(rot.yaw, rot.pitch, false, false);
      }
  
      if (target && target.onGround /*&& target.controlState['jump'] === false*/) {
        // 対象との距離に応じて移動する
        var dist = bot.entity.position.distanceTo(entity.position);
        if(dist > 3) {
          bot.navigate.to(entity.position);
        } else {
          bot.navigate.stop();
        }
      }
    }
  }, 1000);

  setInterval(() => {
    var interest = getInterestEntity();
    if (interest) {
      var isSneaking = false;
      var isJumping = false;
      
      if (interest.kind === 'Drops') {
        isSneaking = true;
      } else if (interest.kind) {
        if (bot.controlState['front'] === true) {
          // モノ以外が足元にある場合ジャンプする
          isJumping = true;
        }
      } else {
        if (interest.metadata['0'] === 2) {
          // 相手がしゃがんでいたらしゃがむ
          isSneaking = true;
        } else {
          // 注目先が自分よりも2m以上下の位置にいたらしゃがむ
          isSneaking = (bot.entity.position.y - interest.position.y > 2 );
        }
      }
      bot.setControlState("sneak", isSneaking);
      bot.setControlState("jump", isJumping);
    }
  }, 200);
}
