package co.edu.upb.grpc;

import static io.grpc.MethodDescriptor.generateFullMethodName;

/**
 */
@javax.annotation.Generated(
    value = "by gRPC proto compiler (version 1.64.0)",
    comments = "Source: nodo_procesamiento.proto")
@io.grpc.stub.annotations.GrpcGenerated
public final class ServicioNodoProcesamientoGrpc {

  private ServicioNodoProcesamientoGrpc() {}

  public static final java.lang.String SERVICE_NAME = "nodoprocesamiento.ServicioNodoProcesamiento";

  // Static method descriptors that strictly reflect the proto.
  private static volatile io.grpc.MethodDescriptor<co.edu.upb.grpc.EstadoNodoRequest,
      co.edu.upb.grpc.EstadoNodoResponse> getObtenerEstadoNodoMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "ObtenerEstadoNodo",
      requestType = co.edu.upb.grpc.EstadoNodoRequest.class,
      responseType = co.edu.upb.grpc.EstadoNodoResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<co.edu.upb.grpc.EstadoNodoRequest,
      co.edu.upb.grpc.EstadoNodoResponse> getObtenerEstadoNodoMethod() {
    io.grpc.MethodDescriptor<co.edu.upb.grpc.EstadoNodoRequest, co.edu.upb.grpc.EstadoNodoResponse> getObtenerEstadoNodoMethod;
    if ((getObtenerEstadoNodoMethod = ServicioNodoProcesamientoGrpc.getObtenerEstadoNodoMethod) == null) {
      synchronized (ServicioNodoProcesamientoGrpc.class) {
        if ((getObtenerEstadoNodoMethod = ServicioNodoProcesamientoGrpc.getObtenerEstadoNodoMethod) == null) {
          ServicioNodoProcesamientoGrpc.getObtenerEstadoNodoMethod = getObtenerEstadoNodoMethod =
              io.grpc.MethodDescriptor.<co.edu.upb.grpc.EstadoNodoRequest, co.edu.upb.grpc.EstadoNodoResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "ObtenerEstadoNodo"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  co.edu.upb.grpc.EstadoNodoRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  co.edu.upb.grpc.EstadoNodoResponse.getDefaultInstance()))
              .setSchemaDescriptor(new ServicioNodoProcesamientoMethodDescriptorSupplier("ObtenerEstadoNodo"))
              .build();
        }
      }
    }
    return getObtenerEstadoNodoMethod;
  }

  private static volatile io.grpc.MethodDescriptor<co.edu.upb.grpc.MetricasNodoRequest,
      co.edu.upb.grpc.MetricasNodoResponse> getObtenerMetricasNodoMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "ObtenerMetricasNodo",
      requestType = co.edu.upb.grpc.MetricasNodoRequest.class,
      responseType = co.edu.upb.grpc.MetricasNodoResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<co.edu.upb.grpc.MetricasNodoRequest,
      co.edu.upb.grpc.MetricasNodoResponse> getObtenerMetricasNodoMethod() {
    io.grpc.MethodDescriptor<co.edu.upb.grpc.MetricasNodoRequest, co.edu.upb.grpc.MetricasNodoResponse> getObtenerMetricasNodoMethod;
    if ((getObtenerMetricasNodoMethod = ServicioNodoProcesamientoGrpc.getObtenerMetricasNodoMethod) == null) {
      synchronized (ServicioNodoProcesamientoGrpc.class) {
        if ((getObtenerMetricasNodoMethod = ServicioNodoProcesamientoGrpc.getObtenerMetricasNodoMethod) == null) {
          ServicioNodoProcesamientoGrpc.getObtenerMetricasNodoMethod = getObtenerMetricasNodoMethod =
              io.grpc.MethodDescriptor.<co.edu.upb.grpc.MetricasNodoRequest, co.edu.upb.grpc.MetricasNodoResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "ObtenerMetricasNodo"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  co.edu.upb.grpc.MetricasNodoRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  co.edu.upb.grpc.MetricasNodoResponse.getDefaultInstance()))
              .setSchemaDescriptor(new ServicioNodoProcesamientoMethodDescriptorSupplier("ObtenerMetricasNodo"))
              .build();
        }
      }
    }
    return getObtenerMetricasNodoMethod;
  }

  private static volatile io.grpc.MethodDescriptor<co.edu.upb.grpc.SolicitudTrabajosRequest,
      co.edu.upb.grpc.RespuestaRecepcionTrabajos> getRecibirTrabajosMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "RecibirTrabajos",
      requestType = co.edu.upb.grpc.SolicitudTrabajosRequest.class,
      responseType = co.edu.upb.grpc.RespuestaRecepcionTrabajos.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<co.edu.upb.grpc.SolicitudTrabajosRequest,
      co.edu.upb.grpc.RespuestaRecepcionTrabajos> getRecibirTrabajosMethod() {
    io.grpc.MethodDescriptor<co.edu.upb.grpc.SolicitudTrabajosRequest, co.edu.upb.grpc.RespuestaRecepcionTrabajos> getRecibirTrabajosMethod;
    if ((getRecibirTrabajosMethod = ServicioNodoProcesamientoGrpc.getRecibirTrabajosMethod) == null) {
      synchronized (ServicioNodoProcesamientoGrpc.class) {
        if ((getRecibirTrabajosMethod = ServicioNodoProcesamientoGrpc.getRecibirTrabajosMethod) == null) {
          ServicioNodoProcesamientoGrpc.getRecibirTrabajosMethod = getRecibirTrabajosMethod =
              io.grpc.MethodDescriptor.<co.edu.upb.grpc.SolicitudTrabajosRequest, co.edu.upb.grpc.RespuestaRecepcionTrabajos>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "RecibirTrabajos"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  co.edu.upb.grpc.SolicitudTrabajosRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  co.edu.upb.grpc.RespuestaRecepcionTrabajos.getDefaultInstance()))
              .setSchemaDescriptor(new ServicioNodoProcesamientoMethodDescriptorSupplier("RecibirTrabajos"))
              .build();
        }
      }
    }
    return getRecibirTrabajosMethod;
  }

  /**
   * Creates a new async stub that supports all call types for the service
   */
  public static ServicioNodoProcesamientoStub newStub(io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<ServicioNodoProcesamientoStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<ServicioNodoProcesamientoStub>() {
        @java.lang.Override
        public ServicioNodoProcesamientoStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new ServicioNodoProcesamientoStub(channel, callOptions);
        }
      };
    return ServicioNodoProcesamientoStub.newStub(factory, channel);
  }

  /**
   * Creates a new blocking-style stub that supports unary and streaming output calls on the service
   */
  public static ServicioNodoProcesamientoBlockingStub newBlockingStub(
      io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<ServicioNodoProcesamientoBlockingStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<ServicioNodoProcesamientoBlockingStub>() {
        @java.lang.Override
        public ServicioNodoProcesamientoBlockingStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new ServicioNodoProcesamientoBlockingStub(channel, callOptions);
        }
      };
    return ServicioNodoProcesamientoBlockingStub.newStub(factory, channel);
  }

  /**
   * Creates a new ListenableFuture-style stub that supports unary calls on the service
   */
  public static ServicioNodoProcesamientoFutureStub newFutureStub(
      io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<ServicioNodoProcesamientoFutureStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<ServicioNodoProcesamientoFutureStub>() {
        @java.lang.Override
        public ServicioNodoProcesamientoFutureStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new ServicioNodoProcesamientoFutureStub(channel, callOptions);
        }
      };
    return ServicioNodoProcesamientoFutureStub.newStub(factory, channel);
  }

  /**
   */
  public interface AsyncService {

    /**
     */
    default void obtenerEstadoNodo(co.edu.upb.grpc.EstadoNodoRequest request,
        io.grpc.stub.StreamObserver<co.edu.upb.grpc.EstadoNodoResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getObtenerEstadoNodoMethod(), responseObserver);
    }

    /**
     */
    default void obtenerMetricasNodo(co.edu.upb.grpc.MetricasNodoRequest request,
        io.grpc.stub.StreamObserver<co.edu.upb.grpc.MetricasNodoResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getObtenerMetricasNodoMethod(), responseObserver);
    }

    /**
     */
    default void recibirTrabajos(co.edu.upb.grpc.SolicitudTrabajosRequest request,
        io.grpc.stub.StreamObserver<co.edu.upb.grpc.RespuestaRecepcionTrabajos> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getRecibirTrabajosMethod(), responseObserver);
    }
  }

  /**
   * Base class for the server implementation of the service ServicioNodoProcesamiento.
   */
  public static abstract class ServicioNodoProcesamientoImplBase
      implements io.grpc.BindableService, AsyncService {

    @java.lang.Override public final io.grpc.ServerServiceDefinition bindService() {
      return ServicioNodoProcesamientoGrpc.bindService(this);
    }
  }

  /**
   * A stub to allow clients to do asynchronous rpc calls to service ServicioNodoProcesamiento.
   */
  public static final class ServicioNodoProcesamientoStub
      extends io.grpc.stub.AbstractAsyncStub<ServicioNodoProcesamientoStub> {
    private ServicioNodoProcesamientoStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected ServicioNodoProcesamientoStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new ServicioNodoProcesamientoStub(channel, callOptions);
    }

    /**
     */
    public void obtenerEstadoNodo(co.edu.upb.grpc.EstadoNodoRequest request,
        io.grpc.stub.StreamObserver<co.edu.upb.grpc.EstadoNodoResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getObtenerEstadoNodoMethod(), getCallOptions()), request, responseObserver);
    }

    /**
     */
    public void obtenerMetricasNodo(co.edu.upb.grpc.MetricasNodoRequest request,
        io.grpc.stub.StreamObserver<co.edu.upb.grpc.MetricasNodoResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getObtenerMetricasNodoMethod(), getCallOptions()), request, responseObserver);
    }

    /**
     */
    public void recibirTrabajos(co.edu.upb.grpc.SolicitudTrabajosRequest request,
        io.grpc.stub.StreamObserver<co.edu.upb.grpc.RespuestaRecepcionTrabajos> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getRecibirTrabajosMethod(), getCallOptions()), request, responseObserver);
    }
  }

  /**
   * A stub to allow clients to do synchronous rpc calls to service ServicioNodoProcesamiento.
   */
  public static final class ServicioNodoProcesamientoBlockingStub
      extends io.grpc.stub.AbstractBlockingStub<ServicioNodoProcesamientoBlockingStub> {
    private ServicioNodoProcesamientoBlockingStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected ServicioNodoProcesamientoBlockingStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new ServicioNodoProcesamientoBlockingStub(channel, callOptions);
    }

    /**
     */
    public co.edu.upb.grpc.EstadoNodoResponse obtenerEstadoNodo(co.edu.upb.grpc.EstadoNodoRequest request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getObtenerEstadoNodoMethod(), getCallOptions(), request);
    }

    /**
     */
    public co.edu.upb.grpc.MetricasNodoResponse obtenerMetricasNodo(co.edu.upb.grpc.MetricasNodoRequest request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getObtenerMetricasNodoMethod(), getCallOptions(), request);
    }

    /**
     */
    public co.edu.upb.grpc.RespuestaRecepcionTrabajos recibirTrabajos(co.edu.upb.grpc.SolicitudTrabajosRequest request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getRecibirTrabajosMethod(), getCallOptions(), request);
    }
  }

  /**
   * A stub to allow clients to do ListenableFuture-style rpc calls to service ServicioNodoProcesamiento.
   */
  public static final class ServicioNodoProcesamientoFutureStub
      extends io.grpc.stub.AbstractFutureStub<ServicioNodoProcesamientoFutureStub> {
    private ServicioNodoProcesamientoFutureStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected ServicioNodoProcesamientoFutureStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new ServicioNodoProcesamientoFutureStub(channel, callOptions);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<co.edu.upb.grpc.EstadoNodoResponse> obtenerEstadoNodo(
        co.edu.upb.grpc.EstadoNodoRequest request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getObtenerEstadoNodoMethod(), getCallOptions()), request);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<co.edu.upb.grpc.MetricasNodoResponse> obtenerMetricasNodo(
        co.edu.upb.grpc.MetricasNodoRequest request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getObtenerMetricasNodoMethod(), getCallOptions()), request);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<co.edu.upb.grpc.RespuestaRecepcionTrabajos> recibirTrabajos(
        co.edu.upb.grpc.SolicitudTrabajosRequest request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getRecibirTrabajosMethod(), getCallOptions()), request);
    }
  }

  private static final int METHODID_OBTENER_ESTADO_NODO = 0;
  private static final int METHODID_OBTENER_METRICAS_NODO = 1;
  private static final int METHODID_RECIBIR_TRABAJOS = 2;

  private static final class MethodHandlers<Req, Resp> implements
      io.grpc.stub.ServerCalls.UnaryMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.ServerStreamingMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.ClientStreamingMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.BidiStreamingMethod<Req, Resp> {
    private final AsyncService serviceImpl;
    private final int methodId;

    MethodHandlers(AsyncService serviceImpl, int methodId) {
      this.serviceImpl = serviceImpl;
      this.methodId = methodId;
    }

    @java.lang.Override
    @java.lang.SuppressWarnings("unchecked")
    public void invoke(Req request, io.grpc.stub.StreamObserver<Resp> responseObserver) {
      switch (methodId) {
        case METHODID_OBTENER_ESTADO_NODO:
          serviceImpl.obtenerEstadoNodo((co.edu.upb.grpc.EstadoNodoRequest) request,
              (io.grpc.stub.StreamObserver<co.edu.upb.grpc.EstadoNodoResponse>) responseObserver);
          break;
        case METHODID_OBTENER_METRICAS_NODO:
          serviceImpl.obtenerMetricasNodo((co.edu.upb.grpc.MetricasNodoRequest) request,
              (io.grpc.stub.StreamObserver<co.edu.upb.grpc.MetricasNodoResponse>) responseObserver);
          break;
        case METHODID_RECIBIR_TRABAJOS:
          serviceImpl.recibirTrabajos((co.edu.upb.grpc.SolicitudTrabajosRequest) request,
              (io.grpc.stub.StreamObserver<co.edu.upb.grpc.RespuestaRecepcionTrabajos>) responseObserver);
          break;
        default:
          throw new AssertionError();
      }
    }

    @java.lang.Override
    @java.lang.SuppressWarnings("unchecked")
    public io.grpc.stub.StreamObserver<Req> invoke(
        io.grpc.stub.StreamObserver<Resp> responseObserver) {
      switch (methodId) {
        default:
          throw new AssertionError();
      }
    }
  }

  public static final io.grpc.ServerServiceDefinition bindService(AsyncService service) {
    return io.grpc.ServerServiceDefinition.builder(getServiceDescriptor())
        .addMethod(
          getObtenerEstadoNodoMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              co.edu.upb.grpc.EstadoNodoRequest,
              co.edu.upb.grpc.EstadoNodoResponse>(
                service, METHODID_OBTENER_ESTADO_NODO)))
        .addMethod(
          getObtenerMetricasNodoMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              co.edu.upb.grpc.MetricasNodoRequest,
              co.edu.upb.grpc.MetricasNodoResponse>(
                service, METHODID_OBTENER_METRICAS_NODO)))
        .addMethod(
          getRecibirTrabajosMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              co.edu.upb.grpc.SolicitudTrabajosRequest,
              co.edu.upb.grpc.RespuestaRecepcionTrabajos>(
                service, METHODID_RECIBIR_TRABAJOS)))
        .build();
  }

  private static abstract class ServicioNodoProcesamientoBaseDescriptorSupplier
      implements io.grpc.protobuf.ProtoFileDescriptorSupplier, io.grpc.protobuf.ProtoServiceDescriptorSupplier {
    ServicioNodoProcesamientoBaseDescriptorSupplier() {}

    @java.lang.Override
    public com.google.protobuf.Descriptors.FileDescriptor getFileDescriptor() {
      return co.edu.upb.grpc.NodoProcesamientoProto.getDescriptor();
    }

    @java.lang.Override
    public com.google.protobuf.Descriptors.ServiceDescriptor getServiceDescriptor() {
      return getFileDescriptor().findServiceByName("ServicioNodoProcesamiento");
    }
  }

  private static final class ServicioNodoProcesamientoFileDescriptorSupplier
      extends ServicioNodoProcesamientoBaseDescriptorSupplier {
    ServicioNodoProcesamientoFileDescriptorSupplier() {}
  }

  private static final class ServicioNodoProcesamientoMethodDescriptorSupplier
      extends ServicioNodoProcesamientoBaseDescriptorSupplier
      implements io.grpc.protobuf.ProtoMethodDescriptorSupplier {
    private final java.lang.String methodName;

    ServicioNodoProcesamientoMethodDescriptorSupplier(java.lang.String methodName) {
      this.methodName = methodName;
    }

    @java.lang.Override
    public com.google.protobuf.Descriptors.MethodDescriptor getMethodDescriptor() {
      return getServiceDescriptor().findMethodByName(methodName);
    }
  }

  private static volatile io.grpc.ServiceDescriptor serviceDescriptor;

  public static io.grpc.ServiceDescriptor getServiceDescriptor() {
    io.grpc.ServiceDescriptor result = serviceDescriptor;
    if (result == null) {
      synchronized (ServicioNodoProcesamientoGrpc.class) {
        result = serviceDescriptor;
        if (result == null) {
          serviceDescriptor = result = io.grpc.ServiceDescriptor.newBuilder(SERVICE_NAME)
              .setSchemaDescriptor(new ServicioNodoProcesamientoFileDescriptorSupplier())
              .addMethod(getObtenerEstadoNodoMethod())
              .addMethod(getObtenerMetricasNodoMethod())
              .addMethod(getRecibirTrabajosMethod())
              .build();
        }
      }
    }
    return result;
  }
}
