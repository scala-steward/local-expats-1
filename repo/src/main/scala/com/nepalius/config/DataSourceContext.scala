package com.nepalius.config

import com.nepalius.config.DatabaseConfig
import com.typesafe.config.ConfigFactory
import io.getquill.jdbczio.Quill
import zio.{ZIO, ZLayer}

import javax.sql.DataSource
import scala.jdk.CollectionConverters.MapHasAsJava

object DataSourceContext:
  val layer: ZLayer[DatabaseConfig, Throwable, DataSource] =
    ZLayer {
      for config <- ZIO.service[DatabaseConfig]
      yield Quill.DataSource.fromConfig(
        ConfigFactory.parseMap(
          DatabaseConfig.parseConnectionInfo(config.url).toMap.asJava,
        ),
      )
    }.flatten
