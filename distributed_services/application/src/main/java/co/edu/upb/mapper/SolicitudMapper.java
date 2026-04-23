package co.edu.upb.mapper;

import java.util.ArrayList;

import co.edu.upb.dto.SolicitudLoteDTO;
import co.edu.upb.entity.SolicitudLote;

public class SolicitudMapper {

    public static SolicitudLoteDTO toDTO(SolicitudLote entity) {
        if (entity == null) {
            return null;
        }

        SolicitudLoteDTO dto = new SolicitudLoteDTO();
        dto.setId(entity.getIdLote());
        dto.setIdUsuario(entity.getUsuarioId());
        dto.setEstado(entity.getEstado());
        dto.setMensaje("Operación realizada correctamente");
        dto.setImagenes(new ArrayList<>());
        return dto;
    }

    public static SolicitudLote toEntity(SolicitudLoteDTO dto) {
        if (dto == null) {
            return null;
        }

        SolicitudLote entity = new SolicitudLote();
        entity.setIdLote(dto.getId());
        entity.setUsuarioId(dto.getIdUsuario());
        entity.setEstado(dto.getEstado());
        return entity;
    }
}